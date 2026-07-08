import { clearCheckboxGroupRequired, syncCheckboxGroupRequired } from "./checkbox-required";
import { debugLog } from "./debug";
import { getSelectorElement } from "./selector";
import type { target } from "./type";

export function setTargetDisplay(targets: target[], isDisplay: boolean): void {
  targets.forEach((targetItem) => {
    const selector = targetItem.selector;
    const required = targetItem.required && isDisplay;
    if (!selector) {
      console.error("[toggleDisplay] targetsのselectorは必須です", targetItem);
      return;
    }

    const targetElm = getSelectorElement(selector, "target");
    if (targetElm == null) {
      console.error("[toggleDisplay] targetsのselector要素が見つかりません", targetItem);
      return;
    }

    if (targetElm.classList.contains("label")) {
      targetElm.style.display = isDisplay ? "" : "none";
      debugLog("target", "グループラベルの表示切替", { selector, isDisplay, required });
      return;
    }

    const targetParentElm = targetElm.closest("li.clr") as HTMLLIElement;
    if (targetParentElm == null) {
      console.error("[toggleDisplay] targetsの親要素が見つかりません", targetItem);
      debugLog("target", "親要素li.clrが見つかりません", {
        selector,
        tagName: targetElm.tagName,
        className: targetElm.className,
      });
      return;
    }

    targetParentElm.style.display = isDisplay ? "" : "none";
    debugLog("target", "ターゲットの表示切替完了", { selector, isDisplay, required });

    const labelElm = targetParentElm.querySelector("label.col.span_3") as HTMLLabelElement | null;
    if (labelElm) {
      labelElm.classList.toggle("required", required ?? false);
    }

    const requiredElm = targetParentElm.querySelector(
      '[type="file"], [type="number"], [type="password"], [type="radio"], [type="text"], select, textarea'
    ) as HTMLInputElement | HTMLSelectElement | null;
    if (requiredElm) {
      requiredElm.required = required ?? false;
    }

    const checkboxElms = Array.from(targetParentElm.querySelectorAll('[type="checkbox"]')) as HTMLInputElement[];
    const uniqueNames = [...new Set(checkboxElms.map((el) => el.name).filter(Boolean))];
    if (required && uniqueNames.length > 0) {
      uniqueNames.forEach((name) => syncCheckboxGroupRequired(name));
    } else {
      uniqueNames.forEach((name) => clearCheckboxGroupRequired(name));
    }
  });
}
