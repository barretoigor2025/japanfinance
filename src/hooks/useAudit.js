import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";

const KEY = "auditHistory";

export function useAudit() {
  const [auditHistory, setAuditState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, []).then(v => { setAuditState(v); setLoading(false); });
  }, []);

  function setAuditHistory(next) {
    const val = typeof next === "function" ? next(auditHistory) : next;
    setAuditState(val);
    dbSet(KEY, val);
  }

  return { auditHistory, setAuditHistory, loading };
}
