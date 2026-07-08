(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // src/debug.ts
  var DEBUG_STORAGE_KEY = "toggleDisplayDebug";
  function isDebugEnabled() {
    if (typeof window === "undefined") return false;
    const win = window;
    if (win.toggleDisplayDebug === true) return true;
    try {
      return localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
    } catch (e) {
      return false;
    }
  }
  function setDebug(enabled) {
    if (typeof window === "undefined") return;
    const win = window;
    win.toggleDisplayDebug = enabled;
    try {
      if (enabled) {
        localStorage.setItem(DEBUG_STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(DEBUG_STORAGE_KEY);
      }
    } catch (e) {
    }
    console.info(`[toggleDisplay] \u30C7\u30D0\u30C3\u30B0\u30ED\u30B0: ${enabled ? "ON" : "OFF"}`);
  }
  function debugLog(category, message, data, force = false) {
    if (!force && !isDebugEnabled()) return;
    console.info(`[toggleDisplay:debug][${category}]`, message, __spreadValues({
      timestamp: Date.now()
    }, data));
  }

  // src/registry.ts
  var rulesBySource = /* @__PURE__ */ new Map();
  var attachedSources = /* @__PURE__ */ new Set();
  var sourceTypes = /* @__PURE__ */ new Map();
  var applyTargetDisplay = null;
  function initRegistry(apply) {
    applyTargetDisplay = apply;
  }
  function getTargetKey(targets) {
    return targets.map((t) => t.selector).join(",");
  }
  function getSourceTypeLabel(sourceType) {
    if (sourceType === "select") return "\u30D7\u30EB\u30C0\u30A6\u30F3";
    if (sourceType === "radio") return "\u30E9\u30B8\u30AA\u30DC\u30BF\u30F3";
    return "\u30C1\u30A7\u30C3\u30AF\u30DC\u30C3\u30AF\u30B9";
  }
  function registerSourceRule(source, targets, sourceType) {
    var _a, _b, _c;
    const apply = applyTargetDisplay;
    if (!apply || !source.selector) return;
    const selector = source.selector;
    const targetKey = getTargetKey(targets);
    const values = (_a = source.values) != null ? _a : [];
    if (values.length === 0) {
      const rules2 = ((_b = rulesBySource.get(selector)) != null ? _b : []).filter((rule) => rule.targetKey !== targetKey);
      if (rules2.length > 0) {
        rulesBySource.set(selector, rules2);
      } else {
        rulesBySource.delete(selector);
      }
      apply(targets, false);
      debugLog("registry", "values\u7A7A\u306E\u305F\u3081\u30EB\u30FC\u30EB\u3092\u524A\u9664\u3057\u975E\u8868\u793A", { selector, targetKey });
      return;
    }
    const regExp = new RegExp(`^(${values.join("|")})$`);
    const rules = ((_c = rulesBySource.get(selector)) != null ? _c : []).filter((rule) => rule.targetKey !== targetKey);
    rules.push({ targetKey, regExp, values, targets });
    rulesBySource.set(selector, rules);
    sourceTypes.set(selector, sourceType);
    attachSourceHandler(selector, sourceType);
    evaluateAllRules(selector, sourceType);
  }
  function evaluateAllRules(selector, sourceType) {
    var _a, _b;
    const apply = applyTargetDisplay;
    if (!apply) return;
    const type = sourceType != null ? sourceType : sourceTypes.get(selector);
    const rules = (_a = rulesBySource.get(selector)) != null ? _a : [];
    if (!type || rules.length === 0) return;
    const evaluationResults = [];
    if (type === "select") {
      const sourceElement = document.querySelector(`[name="${selector}"]`);
      const currentValue = sourceElement ? String(sourceElement.value) : "";
      const selectOptions = sourceElement ? Array.from(sourceElement.options).map((opt) => ({ value: opt.value, text: opt.text })) : [];
      for (const rule of rules) {
        const isMatch = rule.regExp.test(currentValue);
        apply(rule.targets, isMatch);
        evaluationResults.push({
          targetKey: rule.targetKey,
          expectedValues: rule.values,
          isMatch,
          targets: rule.targets
        });
      }
      debugLog("registry", `${getSourceTypeLabel(type)}\u306E\u5168\u30EB\u30FC\u30EB\u8A55\u4FA1`, {
        selector,
        currentValue,
        selectOptions,
        ruleCount: rules.length,
        evaluationResults
      });
      return;
    }
    if (type === "radio") {
      const sourceElements = document.querySelectorAll(`[name="${selector}"]`);
      const radioOptions = Array.from(sourceElements).map((el) => {
        var _a2, _b2, _c, _d, _e, _f, _g;
        return {
          value: el.value,
          label: (_g = (_f = (_c = (_b2 = (_a2 = el.labels) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.textContent) == null ? void 0 : _c.trim()) != null ? _f : (_e = (_d = el.closest("label")) == null ? void 0 : _d.textContent) == null ? void 0 : _e.trim()) != null ? _g : null,
          checked: el.checked
        };
      });
      const checkedElement = document.querySelector(`[name="${selector}"]:checked`);
      const checkedValue = (_b = checkedElement == null ? void 0 : checkedElement.value) != null ? _b : null;
      for (const rule of rules) {
        const isMatch = checkedElement ? rule.regExp.test(checkedElement.value) : false;
        apply(rule.targets, isMatch);
        evaluationResults.push({
          targetKey: rule.targetKey,
          expectedValues: rule.values,
          isMatch,
          targets: rule.targets
        });
      }
      debugLog("registry", `${getSourceTypeLabel(type)}\u306E\u5168\u30EB\u30FC\u30EB\u8A55\u4FA1`, {
        selector,
        checkedValue,
        radioOptions,
        ruleCount: rules.length,
        evaluationResults
      });
      return;
    }
    const checkedElements = document.querySelectorAll(`[name="${selector}"]:checked`);
    const checkedValues = Array.from(checkedElements).map((element) => element.value);
    for (const rule of rules) {
      const isMatch = checkedValues.some((value) => rule.regExp.test(value));
      apply(rule.targets, isMatch);
      evaluationResults.push({
        targetKey: rule.targetKey,
        expectedValues: rule.values,
        isMatch,
        targets: rule.targets
      });
    }
    debugLog("registry", `${getSourceTypeLabel(type)}\u306E\u5168\u30EB\u30FC\u30EB\u8A55\u4FA1`, {
      selector,
      checkedValues,
      ruleCount: rules.length,
      evaluationResults
    });
  }
  function attachSourceHandler(selector, sourceType) {
    if (attachedSources.has(selector)) return;
    attachedSources.add(selector);
    const handler = () => evaluateAllRules(selector, sourceType);
    if (sourceType === "select") {
      const sourceElement = document.querySelector(`[name="${selector}"]`);
      if (sourceElement) {
        sourceElement.addEventListener("change", handler);
      }
      return;
    }
    const sourceElements = document.querySelectorAll(`[name="${selector}"]`);
    sourceElements.forEach((element) => {
      element.addEventListener("change", handler);
    });
  }

  // src/selector.ts
  function getSelectorElement(selector, context) {
    const nameElm = document.querySelector(`[name="${selector}"]`);
    if (nameElm) {
      debugLog("selector", "\u8981\u7D20\u3092name\u5C5E\u6027\u3067\u767A\u898B", {
        selector,
        context,
        matchBy: "name",
        tagName: nameElm.tagName,
        type: nameElm.type
      });
      return nameElm;
    }
    const idElm = document.querySelector(`#file_view_${selector}`);
    if (idElm) {
      debugLog("selector", "\u8981\u7D20\u3092file_view_ID\u3067\u767A\u898B", { selector, context, matchBy: "file_view_id" });
      return idElm;
    }
    const labelElms = document.querySelectorAll("li.label");
    const labelRegExp = new RegExp(`^${selector}$`);
    const labelElm = Array.from(labelElms).filter((e) => labelRegExp.test(e.innerText))[0];
    if (labelElm) {
      debugLog("selector", "\u8981\u7D20\u3092\u30B0\u30EB\u30FC\u30D7\u30E9\u30D9\u30EB\u3067\u767A\u898B", {
        selector,
        context,
        matchBy: "label",
        innerText: labelElm.innerText
      });
      return labelElm;
    }
    debugLog("selector", "\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", {
      selector,
      context,
      readyState: typeof document !== "undefined" ? document.readyState : "unknown"
    });
    return null;
  }

  // src/source-handlers.ts
  function setupAddressValueInterceptor(sourceElement, selector) {
    if (!sourceElement || !/wf\d+-(pf|ct)/.test(selector)) return;
    const descriptor = Object.getOwnPropertyDescriptor(sourceElement, "value");
    if (descriptor && descriptor.configurable === false) {
      return;
    }
    const isPf = selector.endsWith("-pf");
    const proto = isPf ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const d = Object.getOwnPropertyDescriptor(proto, "value");
    if (!(d == null ? void 0 : d.set)) return;
    Object.defineProperty(sourceElement, "value", {
      get() {
        var _a;
        return (_a = d.get) == null ? void 0 : _a.call(this);
      },
      set(v) {
        var _a, _b;
        const old = (_a = d.get) == null ? void 0 : _a.call(this);
        (_b = d.set) == null ? void 0 : _b.call(this, v);
        const event = isPf ? "change" : "input";
        if (v !== old) this.dispatchEvent(new Event(event, { bubbles: true }));
      }
    });
  }
  function setupFileObserver(sourceElement, targets, applyDisplay) {
    if (!sourceElement) return;
    const element = sourceElement;
    if (element._toggleDisplayFileObserver) {
      element._toggleDisplayFileObserver.disconnect();
    }
    applyDisplay(targets, false);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const { target, type } = mutation;
        const { firstElementChild } = target;
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
  function setupTextInputListener(sourceElement, targets, applyDisplay) {
    if (!sourceElement) return;
    const element = sourceElement;
    if (element._toggleDisplayInputHandler) {
      element.removeEventListener("input", element._toggleDisplayInputHandler);
    }
    applyDisplay(targets, String(element.value).length > 0);
    element._toggleDisplayInputHandler = (event) => {
      const eventElement = event.target;
      applyDisplay(targets, eventElement ? String(eventElement.value).length > 0 : false);
    };
    element.addEventListener("input", element._toggleDisplayInputHandler);
  }

  // src/checkbox-required.ts
  function getCheckboxGroup(name) {
    return Array.from(document.querySelectorAll(`[name="${name}"][type="checkbox"]`));
  }
  function clearCheckboxGroupRequired(name) {
    const group = getCheckboxGroup(name);
    group.forEach((el) => {
      const handler = el._toggleDisplayCheckboxRequiredHandler;
      if (handler) el.removeEventListener("change", handler);
      el.required = false;
      delete el._toggleDisplayCheckboxRequiredHandler;
    });
    debugLog("checkbox", "\u30C1\u30A7\u30C3\u30AF\u30DC\u30C3\u30AF\u30B9\u5FC5\u9808\u5316\u3092\u89E3\u9664", { name, count: group.length });
  }
  function syncCheckboxGroupRequired(name) {
    const apply = () => {
      const group = getCheckboxGroup(name);
      const anyChecked = group.some((el) => el.checked);
      group.forEach((el) => el.required = !anyChecked);
      debugLog("checkbox", "\u30C1\u30A7\u30C3\u30AF\u30DC\u30C3\u30AF\u30B9\u5FC5\u9808\u72B6\u614B\u3092\u540C\u671F", { name, anyChecked, count: group.length });
    };
    apply();
    getCheckboxGroup(name).forEach((el) => {
      el.removeEventListener("change", el._toggleDisplayCheckboxRequiredHandler);
      el._toggleDisplayCheckboxRequiredHandler = apply;
      el.addEventListener("change", el._toggleDisplayCheckboxRequiredHandler);
    });
  }

  // src/target-display.ts
  function setTargetDisplay(targets, isDisplay) {
    targets.forEach((targetItem) => {
      const selector = targetItem.selector;
      const required = targetItem.required && isDisplay;
      if (!selector) {
        console.error("[toggleDisplay] targets\u306Eselector\u306F\u5FC5\u9808\u3067\u3059", targetItem);
        return;
      }
      const targetElm = getSelectorElement(selector, "target");
      if (targetElm == null) {
        console.error("[toggleDisplay] targets\u306Eselector\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", targetItem);
        return;
      }
      if (targetElm.classList.contains("label")) {
        targetElm.style.display = isDisplay ? "" : "none";
        debugLog("target", "\u30B0\u30EB\u30FC\u30D7\u30E9\u30D9\u30EB\u306E\u8868\u793A\u5207\u66FF", { selector, isDisplay, required });
        return;
      }
      const targetParentElm = targetElm.closest("li.clr");
      if (targetParentElm == null) {
        console.error("[toggleDisplay] targets\u306E\u89AA\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", targetItem);
        debugLog("target", "\u89AA\u8981\u7D20li.clr\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", {
          selector,
          tagName: targetElm.tagName,
          className: targetElm.className
        });
        return;
      }
      targetParentElm.style.display = isDisplay ? "" : "none";
      debugLog("target", "\u30BF\u30FC\u30B2\u30C3\u30C8\u306E\u8868\u793A\u5207\u66FF\u5B8C\u4E86", { selector, isDisplay, required });
      const labelElm = targetParentElm.querySelector("label.col.span_3");
      if (labelElm) {
        labelElm.classList.toggle("required", required != null ? required : false);
      }
      const requiredElm = targetParentElm.querySelector(
        '[type="file"], [type="number"], [type="password"], [type="radio"], [type="text"], select, textarea'
      );
      if (requiredElm) {
        requiredElm.required = required != null ? required : false;
      }
      const checkboxElms = Array.from(targetParentElm.querySelectorAll('[type="checkbox"]'));
      const uniqueNames = [...new Set(checkboxElms.map((el) => el.name).filter(Boolean))];
      if (required && uniqueNames.length > 0) {
        uniqueNames.forEach((name) => syncCheckboxGroupRequired(name));
      } else {
        uniqueNames.forEach((name) => clearCheckboxGroupRequired(name));
      }
    });
  }

  // src/index.ts
  if (typeof window.jQuery !== "undefined" && window.jQuery.datepicker) {
    window.jQuery.datepicker.setDefaults({
      onSelect: function(dateText, inst) {
        const input = inst && inst.input && inst.input.get(0);
        if (input) {
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pageshow", (event) => {
      debugLog("pageshow", "\u30E9\u30A4\u30D6\u30E9\u30EA\u5185pageshow\u767A\u706B", {
        persisted: event.persisted,
        readyState: document.readyState
      });
      document.querySelectorAll('[type="file"]').forEach((e) => e.value = "");
      const submitBtn = document.querySelector('.row.submit_btn input[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    });
  }
  initRegistry(setTargetDisplay);
  function toggleDisplay(object) {
    debugLog("toggle", "toggleDisplay\u547C\u3073\u51FA\u3057", {
      source: object == null ? void 0 : object.source,
      targets: object == null ? void 0 : object.targets,
      readyState: typeof document !== "undefined" ? document.readyState : "unknown"
    });
    if (!object) {
      console.error("[toggleDisplay] \u5F15\u6570\u306F\u5FC5\u9808\u3067\u3059");
      return;
    }
    const { source, targets } = object;
    if (!source) {
      console.error("[toggleDisplay] source\u306F\u5FC5\u9808\u3067\u3059", object);
      return;
    }
    if (!source.selector) {
      console.error("[toggleDisplay] source\u306Eselector\u306F\u5FC5\u9808\u3067\u3059", object);
      return;
    }
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      console.error("[toggleDisplay] targets\u306F\u5FC5\u9808\u3067\u3059", object);
      return;
    }
    if (targets.some((target) => !target.selector)) {
      console.error("[toggleDisplay] targets\u306Eselector\u306F\u5FC5\u9808\u3067\u3059", object);
      return;
    }
    const sourceElement = getSelectorElement(source.selector, "source");
    if (sourceElement == null) {
      console.error("[toggleDisplay] source\u306Eselector\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", object);
      return;
    }
    setupAddressValueInterceptor(sourceElement, source.selector);
    const sourceType = sourceElement.type;
    const sourceTagName = sourceElement.tagName.toLowerCase();
    const sourceId = sourceElement.id;
    debugLog("toggle", "source\u8981\u7D20\u306E\u7A2E\u5225\u3092\u5224\u5B9A", {
      selector: source.selector,
      sourceType,
      sourceTagName,
      sourceId,
      values: source.values
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
  function getVersion() {
    return "1.1.0";
  }
  if (typeof window !== "undefined") {
    window.toggleDisplay = toggleDisplay;
    window.toggleDisplayVersion = getVersion;
    window.toggleDisplaySetDebug = setDebug;
    window.toggleDisplayIsDebug = isDebugEnabled;
    debugLog(
      "init",
      "toggleDisplay\u30B9\u30AF\u30EA\u30D7\u30C8\u8AAD\u307F\u8FBC\u307F\u5B8C\u4E86",
      {
        readyState: document.readyState,
        version: getVersion()
      },
      true
    );
  }
})();
//# sourceMappingURL=td.js.map
