import { useState, useEffect, useCallback } from "react";
import { SchoolConfig } from "../types";

const LS_KEY = "terranova_config";

const DEFAULTS: SchoolConfig = {
  nombre: "TerraNova Academy",
  director: "",
  direccion: "",
  telefono: "",
  correo: "",
  ugel: "",
  notaMinima: "11",
  maxFaltas: "30",
};

function loadConfig(): SchoolConfig {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useConfiguracion() {
  const [config, setConfig] = useState<SchoolConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const handleChange = useCallback((field: keyof SchoolConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setStatus("idle");
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(config));
      setSaved(true);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [config]);

  return { config, saved, status, handleChange, handleSave };
}
