import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";
import { defaultGastos } from "../utils/calc.js";

const KEY = "gastos";

export function useGastos() {
  const [gastos, setGastosState] = useState(defaultGastos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, defaultGastos).then(v => {
      setGastosState({ ...defaultGastos, ...v });
      setLoading(false);
    });
  }, []);

  function setGastos(next) {
    const val = typeof next === "function" ? next(gastos) : next;
    setGastosState(val);
    dbSet(KEY, val);
  }

  return { gastos, setGastos, loading };
}
