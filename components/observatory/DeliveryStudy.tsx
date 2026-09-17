"use client";
import { useState } from "react";
export default function DeliveryStudy() {
  const [offline, setOffline] = useState(false);
  const [sent, setSent] = useState(false);
  return <div className="delivery-study"><p className="micro">An illustrated fan-out</p><div className={`delivery-paths${sent ? " is-sent" : ""}`}><span className="delivery-source">Message</span><span className="delivery-branches" aria-hidden="true" /><div className="delivery-recipients">{["A", "B", "C"].map((name,i) => <span key={name} className={sent && !(i === 1 && offline) ? "delivered" : ""}>{name}<small>{sent ? i === 1 && offline ? "Unavailable" : "Delivered" : "Waiting"}</small></span>)}</div></div><div className="delivery-controls"><label><input type="checkbox" checked={offline} onChange={e => { setOffline(e.target.checked); setSent(false); }} /> Take recipient B offline</label><button className="text-link" onClick={() => setSent(true)}>Send a sample message ↗</button></div><p role="status" className="delivery-status">{sent ? offline ? "A and C received the message. B’s failure did not cancel the other deliveries." : "All three recipients received the message." : "Try sending with one recipient offline. Watch which deliveries complete."}</p></div>;
}
