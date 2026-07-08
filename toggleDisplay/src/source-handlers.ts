import type { selectorElement, target } from "./type";

type ApplyDisplay = (targets: target[], isDisplay: boolean) => void;

export function setupAddressValueInterceptor(sourceElement: selectorElement, selector: string): void {
  if (!sourceElement || !/wf\d+-(pf|ct)/.test(selector)) return;

  const descriptor = Object.getOwnPropertyDescriptor(sourceElement, "value");
  if (descriptor && descriptor.configurable === false) {
    return;
  }

  const isPf = selector.endsWith("-pf");
  const proto = isPf ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const d = Object.getOwnPropertyDescriptor(proto, "value");
  if (!d?.set) return;

  Object.defineProperty(sourceElement, "value", {
    get() {
      return d.get?.call(this);
    },
    set(v) {
      const old = d.get?.call(this);
      d.set?.call(this, v);
      const event = isPf ? "change" : "input";
      if (v !== old) this.dispatchEvent(new Event(event, { bubbles: true }));
    },
  });
}

export function setupFileObserver(
  sourceElement: selectorElement,
  targets: target[],
  applyDisplay: ApplyDisplay
): void {
  if (!sourceElement) return;

  const element = sourceElement as HTMLElement & {
    _toggleDisplayFileObserver?: MutationObserver;
  };

  if (element._toggleDisplayFileObserver) {
    element._toggleDisplayFileObserver.disconnect();
  }

  applyDisplay(targets, false);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const { target, type } = mutation;
      const { firstElementChild } = target as HTMLElement;
      const isDisplay = type === "childList" && firstElementChild ? true : false;
      applyDisplay(targets, isDisplay);
    });
  });

  observer.observe(element, { childList: true, subtree: true });
  element._toggleDisplayFileObserver = observer;

  if (typeof window !== "undefined") {
    const disconnectObserver = () => {
      observer.disconnect();
      delete element._toggleDisplayFileObserver;
    };
    window.addEventListener("beforeunload", disconnectObserver, { once: true });
  }
}

export function setupTextInputListener(
  sourceElement: selectorElement,
  targets: target[],
  applyDisplay: ApplyDisplay
): void {
  if (!sourceElement) return;

  const element = sourceElement as HTMLInputElement | HTMLTextAreaElement & {
    _toggleDisplayInputHandler?: (event: Event) => void;
  };

  if (element._toggleDisplayInputHandler) {
    element.removeEventListener("input", element._toggleDisplayInputHandler);
  }

  applyDisplay(targets, String(element.value).length > 0);

  element._toggleDisplayInputHandler = (event: Event) => {
    const eventElement = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    applyDisplay(targets, eventElement ? String(eventElement.value).length > 0 : false);
  };
  element.addEventListener("input", element._toggleDisplayInputHandler);
}
