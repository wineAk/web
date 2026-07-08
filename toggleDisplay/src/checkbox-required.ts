import { debugLog } from "./debug";

function getCheckboxGroup(name: string): HTMLInputElement[] {
  return Array.from(document.querySelectorAll(`[name="${name}"][type="checkbox"]`)) as HTMLInputElement[];
}

export function clearCheckboxGroupRequired(name: string): void {
  const group = getCheckboxGroup(name);
  group.forEach((el) => {
    const handler = (el as any)._toggleDisplayCheckboxRequiredHandler;
    if (handler) el.removeEventListener("change", handler);
    el.required = false;
    delete (el as any)._toggleDisplayCheckboxRequiredHandler;
  });
  debugLog("checkbox", "チェックボックス必須化を解除", { name, count: group.length });
}

export function syncCheckboxGroupRequired(name: string): void {
  const apply = () => {
    const group = getCheckboxGroup(name);
    const anyChecked = group.some((el) => el.checked);
    group.forEach((el) => (el.required = !anyChecked));
    debugLog("checkbox", "チェックボックス必須状態を同期", { name, anyChecked, count: group.length });
  };

  apply();

  getCheckboxGroup(name).forEach((el) => {
    el.removeEventListener("change", (el as any)._toggleDisplayCheckboxRequiredHandler);
    (el as any)._toggleDisplayCheckboxRequiredHandler = apply;
    el.addEventListener("change", (el as any)._toggleDisplayCheckboxRequiredHandler);
  });
}
