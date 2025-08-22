(() => {
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
  function getSelectorElement(selector) {
    const nameElm = document.querySelector(`[name="${selector}"]`);
    if (nameElm) return nameElm;
    const idElm = document.querySelector(`#file_view_${selector}`);
    if (idElm) return idElm;
    const labelElms = document.querySelectorAll("li.label");
    const labelRegExp = new RegExp(`^${selector}$`);
    const labelElm = Array.from(labelElms).filter((e) => labelRegExp.test(e.innerText))[0];
    if (labelElm) return labelElm;
    return null;
  }
  function setTargetDisplay(targets, isDisplay) {
    targets.forEach((target) => {
      const selector = target.selector;
      const required = target.required && isDisplay;
      if (!selector) {
        console.error("[toggleDisplay] targets\u306Eselector\u306F\u5FC5\u9808\u3067\u3059", target);
        return;
      }
      const targetElm = getSelectorElement(selector);
      if (targetElm == null) {
        console.error("[toggleDisplay] targets\u306Eselector\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", target);
        return;
      }
      if (targetElm.className === "label") {
        targetElm.style.display = isDisplay ? "" : "none";
        return;
      }
      const targetParentElm = targetElm.closest("li.clr");
      if (targetParentElm == null) {
        console.error("[toggleDisplay] targets\u306E\u89AA\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", target);
        return;
      }
      targetParentElm.style.display = isDisplay ? "" : "none";
      const labelElm = targetParentElm.querySelector("label.col.span_3");
      if (labelElm) {
        labelElm.classList.toggle("required", required != null ? required : false);
      }
      const requiredElm = targetParentElm.querySelector('[type="number"], [type="password"], [type="radio"], [type="text"], select, textarea');
      if (requiredElm) {
        requiredElm.required = required != null ? required : false;
      }
      const checkboxElms = Array.from(targetParentElm.querySelectorAll('[type="checkbox"]'));
      checkboxElms.forEach((element) => {
        element.removeEventListener("change", element._toggleDisplayChangeHandler);
        element._toggleDisplayChangeHandler = () => {
          const isChecked = targetParentElm.querySelector('[type="checkbox"]:checked') !== null;
          checkboxElms.forEach((elm) => elm.required = !isChecked);
        };
        element.addEventListener("change", element._toggleDisplayChangeHandler);
      });
    });
  }
  function toggleDisplay(object) {
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
    const sourceElement = getSelectorElement(source.selector);
    if (sourceElement == null) {
      console.error("[toggleDisplay] source\u306Eselector\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093", object);
      return;
    }
    if (/wf\d+-(pf|ct)/.test(source.selector)) {
      const descriptor = Object.getOwnPropertyDescriptor(sourceElement, "value");
      if (descriptor && descriptor.configurable === false) {
        return;
      }
      const isPf = source.selector.endsWith("-pf");
      const proto = isPf ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      const d = Object.getOwnPropertyDescriptor(proto, "value");
      if (d && d.set) {
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
    }
    const sourceType = sourceElement.type;
    const sourceTagName = sourceElement.tagName.toLowerCase();
    const sourceId = sourceElement.id;
    if (sourceTagName === "select") {
      const values = source.values ? source.values : [];
      if (values.length > 0) {
        const regExp = new RegExp(`^(${values.join("|")})$`);
        setTargetDisplay(targets, regExp.test(String(sourceElement.value)));
        sourceElement.addEventListener("change", (event) => {
          const eventElement = event.target;
          setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
        });
      } else {
        setTargetDisplay(targets, false);
      }
    } else if (sourceTagName === "p" && /^file_view_/.test(sourceId)) {
      setTargetDisplay(targets, false);
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const { target, type } = mutation;
          const { firstElementChild } = target;
          const isDisplay = type === "childList" && firstElementChild ? true : false;
          setTargetDisplay(targets, isDisplay);
        });
      });
      const config = { childList: true, subtree: true };
      observer.observe(sourceElement, config);
    } else if (sourceType === "checkbox") {
      const values = source.values ? source.values : [];
      if (values.length > 0) {
        const regExp = new RegExp(`^(${values.join("|")})$`);
        const setCheckedDisplay = () => {
          const checkedElements = document.querySelectorAll(`[name="${source.selector}"]:checked`);
          const checkedValues = Array.from(checkedElements).map((element) => element.value);
          const isDisplay = checkedValues.some((value) => regExp.test(value));
          setTargetDisplay(targets, isDisplay);
        };
        setCheckedDisplay();
        const sourceElements = document.querySelectorAll(`[name="${source.selector}"]`);
        sourceElements.forEach((element) => {
          element.addEventListener("change", (event) => {
            setCheckedDisplay();
          });
        });
      } else {
        setTargetDisplay(targets, false);
      }
    } else if (sourceType === "radio") {
      const values = source.values ? source.values : [];
      if (values.length > 0) {
        const regExp = new RegExp(`^(${values.join("|")})$`);
        const checkedElement = document.querySelector(`[name="${source.selector}"]:checked`);
        setTargetDisplay(targets, checkedElement ? regExp.test(checkedElement.value) : false);
        const sourceElements = document.querySelectorAll(`[name="${source.selector}"]`);
        sourceElements.forEach((element) => {
          element.addEventListener("change", (event) => {
            const eventElement = event.target;
            setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
          });
        });
      } else {
        setTargetDisplay(targets, false);
      }
    } else {
      setTargetDisplay(targets, String(sourceElement.value).length > 0);
      sourceElement.addEventListener("input", (event) => {
        const eventElement = event.target;
        setTargetDisplay(targets, eventElement ? String(eventElement.value).length > 0 : false);
      });
    }
  }
  function getVersion() {
    return "1.0.0";
  }
  if (typeof window !== "undefined") {
    window.toggleDisplay = toggleDisplay;
    window.toggleDisplayVersion = getVersion;
  }
})();
//# sourceMappingURL=td.js.map
