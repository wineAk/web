import { debugLog } from "./debug";
import type { selectorElement } from "./type";

export function getSelectorElement(selector: string, context?: string): selectorElement {
  const nameElm = document.querySelector(`[name="${selector}"]`);
  if (nameElm) {
    debugLog("selector", "要素をname属性で発見", {
      selector,
      context,
      matchBy: "name",
      tagName: nameElm.tagName,
      type: (nameElm as HTMLInputElement).type,
    });
    return nameElm as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  }

  const idElm = document.querySelector(`#file_view_${selector}`);
  if (idElm) {
    debugLog("selector", "要素をfile_view_IDで発見", { selector, context, matchBy: "file_view_id" });
    return idElm as HTMLInputElement;
  }

  const labelElms = document.querySelectorAll("li.label") as NodeListOf<HTMLLIElement>;
  const labelRegExp = new RegExp(`^${selector}$`);
  const labelElm = Array.from(labelElms).filter((e) => labelRegExp.test(e.innerText))[0];
  if (labelElm) {
    debugLog("selector", "要素をグループラベルで発見", {
      selector,
      context,
      matchBy: "label",
      innerText: labelElm.innerText,
    });
    return labelElm;
  }

  debugLog("selector", "要素が見つかりません", {
    selector,
    context,
    readyState: typeof document !== "undefined" ? document.readyState : "unknown",
  });
  return null;
}
