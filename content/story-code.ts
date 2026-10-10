// Short, real-shaped code for each step of the story. Simplified from production code; names changed.

export const storyCode: Record<string, { file: string; lang: string; code: string }> = {
  interface: {
    file: "app/invoices/new/invoice-form.tsx",
    lang: "tsx",
    code: `
export function InvoiceForm({ products }: { products: Product[] }) {
  const [lines, setLines] = useState<Line[]>([]);
  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  return (
    <form action={createInvoice}>
      <ProductSearch products={products} onPick={(p) => setLines(addLine(lines, p))} />
      <LineItems lines={lines} onChange={setLines} />
      <output name="total">{formatINR(total)}</output>
      <SubmitButton disabled={lines.length === 0}>Create invoice</SubmitButton>
    </form>
  );
}`,
  },
  api: {
    file: "src/routes/invoices.rs",
    lang: "rust",
    code: `
async fn create_invoice(
    State(app): State<AppState>,
    user: AuthUser,                          // 401 before we get here without a valid token
    Json(input): Json<NewInvoice>,
) -> Result<(StatusCode, Json<Invoice>), ApiError> {
    user.require(Permission::CreateInvoice)?;   // 403 for the wrong role
    input.validate()?;                           // 422 for an empty or invalid bill
    let invoice = billing::create(&app.db, user.tenant_id(), input).await?;
    Ok((StatusCode::CREATED, Json(invoice)))
}`,
  },
  data: {
    file: "src/billing/create-invoice.ts",
    lang: "ts",
    code: `
const invoice = await db.tx(async (t) => {
  for (const line of bill.lines) {
    const { qty } = await t.one(
      "SELECT qty FROM stock WHERE sku = $1 FOR UPDATE", [line.sku]);   // lock the row
    if (qty < line.qty) throw new OutOfStock(line.sku);                 // → ROLLBACK
    await t.none("UPDATE stock SET qty = qty - $1 WHERE sku = $2", [line.qty, line.sku]);
  }
  const inv = await t.one("INSERT INTO invoices (customer_id, total) VALUES ($1, $2) RETURNING id",
    [bill.customerId, bill.total]);
  await t.none("INSERT INTO ledger (customer_id, invoice_id, amount) VALUES ($1, $2, $3)",
    [bill.customerId, inv.id, bill.total]);
  return inv;
});                                                       // COMMIT: all three, or none

await pdfQueue.add("render", { invoiceId: invoice.id });  // slow work leaves the request`,
  },
  ship: {
    file: ".github/workflows/deploy.yml",
    lang: "yaml",
    code: `
on:
  push: { branches: [main] }
jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test                  # a failing test stops the line here
      - run: docker build -t $IMAGE:$GITHUB_SHA .
      - run: docker push $IMAGE:$GITHUB_SHA
      - run: ./deploy.sh $GITHUB_SHA             # rolling back = deploying the previous SHA`,
  },
  ai: {
    file: "src/assistant/answer.ts",
    lang: "ts",
    code: `
const vector = await embed(question);
const hits = await index.query({ vector, topK: 4, filter: { shopId } });   // only this shop's data

const reply = await openai.chat.completions.create({
  model,
  messages: [
    { role: "system", content:
      "Answer only from the shop data provided. Reply in the user's language: Hindi, English or Hinglish." },
    { role: "user", content: \`\${hits.map((h) => h.text).join("\\n")}\\n\\nQ: \${question}\` },
  ],
});`,
  },
  run: {
    file: "src/realtime/broadcast.ts",
    lang: "ts",
    code: `
// One dead connection must not cancel everyone else's message.
const results = await Promise.allSettled(
  connections.map((c) => gateway.postToConnection({ ConnectionId: c.id, Data: payload })),
);
const gone = results.flatMap((r, i) =>
  r.status === "rejected" && r.reason?.statusCode === 410 ? [connections[i].id] : []);
await removeStaleConnections(gone);   // clean up; the broadcast still succeeded`,
  },
};
