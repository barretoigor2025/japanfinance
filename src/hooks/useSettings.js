import { useState, useEffect } from "react";
import { dbGet, dbSet } from "../db/db.js";
import { defaultSettings } from "../utils/calc.js";

const KEY = "settings";

export function useSettings() {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGet(KEY, defaultSettings).then(v => {
      setSettingsState({ ...defaultSettings, ...v });
      setLoading(false);
    });
  }, []);

  function setSettings(next) {
    const val = typeof next === "function" ? next(settings) : next;
    setSettingsState(val);
    dbSet(KEY, val);
  }

  return { settings, setSettings, loading };
}
