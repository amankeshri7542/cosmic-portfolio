export default function SocialImage({ title, article = false }: { title: string; article?: boolean }) {
  if (!article) return <div style={{ display:"flex", width:"100%", height:"100%", position:"relative", background:"#080b17", color:"#eef0ff", padding:"60px 64px", overflow:"hidden" }}>
    <div style={{ display:"flex", flexDirection:"column", width:710, justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:20 }}><span style={{ fontSize:44, fontWeight:700, letterSpacing:-4 }}>ak.</span><span style={{ fontSize:25 }}>Aman Kumar</span></div>
      <div style={{ display:"flex", flexDirection:"column", fontSize:70, lineHeight:1.08, fontWeight:700, letterSpacing:-3 }}><span>I build the whole</span><span>product.</span><span style={{ color:"#b9a0ff" }}>From UI to AI to cloud.</span></div>
      <div style={{ display:"flex", fontSize:22, color:"#a0a7c1" }}>Full-stack software engineer · amankeshri.com</div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:16, position:"absolute", right:-10, top:110, width:350, transform:"rotate(-12deg)" }}>
      {[
        ["INTERFACE", "React · Next.js", "#88dcd7"],
        ["BACKEND & DATA", "Rust · PostgreSQL", "#b9a0ff"],
        ["APPLIED AI", "Python · RAG", "#f0bdce"],
        ["CLOUD & DELIVERY", "AWS · Docker", "#ecc28d"],
      ].map(([label, tools, color]) => <div key={label} style={{ display:"flex", flexDirection:"column", gap:12, padding:"22px 28px", height:104, borderRadius:12, border:`1px solid ${color}`, background:"#131b30", boxShadow:"0 7px 0 #050812" }}><span style={{ fontSize:13, letterSpacing:2, color }}>{label}</span><span style={{ fontSize:25 }}>{tools}</span></div>)}
    </div>
  </div>;
  return <div style={{display:"flex",width:"100%",height:"100%",padding:"60px 72px",background:"#111c32",color:"#e3eaf0",flexDirection:"column",justifyContent:"space-between",borderBottom:"12px solid #ce816e"}}><div style={{display:"flex",fontSize:24,color:"#e8bd79",letterSpacing:4}}>{article ? "FIELD NOTES / AMAN KUMAR" : "AMAN KUMAR / SOFTWARE ENGINEER"}</div><div style={{display:"flex",fontSize:title.length>90?54:68,lineHeight:1.12,letterSpacing:-2,maxWidth:1040}}>{title}</div><div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #516577",paddingTop:25,fontSize:24}}><span>Full-stack engineering. AI to cloud.</span><span>amankeshri.com</span></div></div>;
}
