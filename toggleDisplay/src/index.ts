import { debugLog, isDebugEnabled, setDebug } from "./debug";
import { initRegistry, registerSourceRule } from "./registry";
import { getSelectorElement } from "./selector";
import { setupAddressValueInterceptor, setupFileObserver, setupTextInputListener } from "./source-handlers";
import { setTargetDisplay } from "./target-display";
import type { toggleDisplay } from "./type";

// Datepickerで入力された際はinputイベントを発火させる
// @ts-ignore
if (typeof (window as any).jQuery !== "undefined" && (window as any).jQuery.datepicker) {
  (window as any).jQuery.datepicker.setDefaults({
    onSelect: function (dateText, inst) {
      const input = inst && inst.input && inst.input.get(0);
      if (input) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
  });
}

// ページ表示時の不具合修正
if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (event) => {
    debugLog("pageshow", "ライブラリ内pageshow発火", {
      persisted: event.persisted,
      readyState: document.readyState,
    });
    document.querySelectorAll('[type="file"]').forEach((e) => ((e as HTMLInputElement).value = ""));
    const submitBtn = document.querySelector('.row.submit_btn input[type="submit"]') as HTMLInputElement | null;
    if (submitBtn) submitBtn.disabled = false;
  });
}

initRegistry(setTargetDisplay);

export function toggleDisplay(object?: toggleDisplay): void {
  debugLog("toggle", "toggleDisplay呼び出し", {
    source: object?.source,
    targets: object?.targets,
    readyState: typeof document !== "undefined" ? document.readyState : "unknown",
  });

  if (!object) {
    console.error("[toggleDisplay] 引数は必須です");
    return;
  }

  const { source, targets } = object;
  if (!source) {
    console.error("[toggleDisplay] sourceは必須です", object);
    return;
  }
  if (!source.selector) {
    console.error("[toggleDisplay] sourceのselectorは必須です", object);
    return;
  }
  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    console.error("[toggleDisplay] targetsは必須です", object);
    return;
  }
  if (targets.some((target) => !target.selector)) {
    console.error("[toggleDisplay] targetsのselectorは必須です", object);
    return;
  }

  const sourceElement = getSelectorElement(source.selector, "source");
  if (sourceElement == null) {
    console.error("[toggleDisplay] sourceのselector要素が見つかりません", object);
    return;
  }

  setupAddressValueInterceptor(sourceElement, source.selector);

  const sourceType = sourceElement.type;
  const sourceTagName = sourceElement.tagName.toLowerCase();
  const sourceId = sourceElement.id;

  debugLog("toggle", "source要素の種別を判定", {
    selector: source.selector,
    sourceType,
    sourceTagName,
    sourceId,
    values: source.values,
  });

  if (sourceTagName === "select") {
    registerSourceRule(source, targets, "select");
  } else if (sourceTagName === "p" && /^file_view_/.test(sourceId)) {
    setupFileObserver(sourceElement, targets, setTargetDisplay);
  } else if (sourceType === "checkbox") {
    registerSourceRule(source, targets, "checkbox");
  } else if (sourceType === "radio") {
    registerSourceRule(source, targets, "radio");
  } else {
    setupTextInputListener(sourceElement, targets, setTargetDisplay);
  }
}

export { setDebug, isDebugEnabled } from "./debug";

export function getVersion(): string {
  return "{{VERSION}}";
}

if (typeof window !== "undefined") {
  (window as any).toggleDisplay = toggleDisplay;
  (window as any).toggleDisplayVersion = getVersion;
  (window as any).toggleDisplaySetDebug = setDebug;
  (window as any).toggleDisplayIsDebug = isDebugEnabled;
  debugLog(
    "init",
    "toggleDisplayスクリプト読み込み完了",
    {
      readyState: document.readyState,
      version: getVersion(),
    },
    true
  );
}
