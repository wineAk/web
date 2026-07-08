const DEBUG_STORAGE_KEY = "toggleDisplayDebug";

export type DebugCategory =
  | "init"
  | "pageshow"
  | "toggle"
  | "selector"
  | "target"
  | "registry"
  | "checkbox";

export function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as Window & { toggleDisplayDebug?: boolean };
  if (win.toggleDisplayDebug === true) return true;
  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setDebug(enabled: boolean): void {
  if (typeof window === "undefined") return;
  const win = window as Window & { toggleDisplayDebug?: boolean };
  win.toggleDisplayDebug = enabled;
  try {
    if (enabled) {
      localStorage.setItem(DEBUG_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
  console.info(`[toggleDisplay] デバッグログ: ${enabled ? "ON" : "OFF"}`);
}

export function debugLog(
  category: DebugCategory,
  message: string,
  data?: Record<string, unknown>,
  force = false
): void {
  if (!force && !isDebugEnabled()) return;

  console.info(`[toggleDisplay:debug][${category}]`, message, {
    timestamp: Date.now(),
    ...data,
  });
}
