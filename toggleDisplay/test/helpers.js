function assert(name, condition) {
  const el = document.createElement("div");
  el.textContent = (condition ? "PASS: " : "FAIL: ") + name;
  el.style.color = condition ? "green" : "red";
  document.getElementById("result").appendChild(el);
  if (!condition) window.__testFailed = true;
}

function isTargetVisibleByName(name) {
  const parent = document.querySelector(`[name="${name}"]`)?.closest("li.clr");
  return parent ? parent.style.display !== "none" : false;
}

function isTargetVisibleById(id) {
  const el = document.getElementById(id);
  return el ? el.style.display !== "none" : false;
}

function isLabelVisible(innerText) {
  const labelElms = document.querySelectorAll("li.label");
  const labelRegExp = new RegExp(`^${innerText}$`);
  const labelElm = Array.from(labelElms).filter((e) => labelRegExp.test(e.innerText))[0];
  return labelElm ? labelElm.style.display !== "none" : false;
}

function showAllPassed() {
  if (!window.__testFailed) {
    const ok = document.createElement("div");
    ok.textContent = "ALL TESTS PASSED";
    ok.style.color = "blue";
    ok.style.fontWeight = "bold";
    document.getElementById("result").appendChild(ok);
  }
}
