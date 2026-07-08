import { debugLog } from "./debug";
import type { source, target } from "./type";

export type SourceType = "select" | "radio" | "checkbox";

type SourceRule = {
  targetKey: string;
  regExp: RegExp;
  values: string[];
  targets: target[];
};

type ApplyTargetDisplay = (targets: target[], isDisplay: boolean) => void;

const rulesBySource = new Map<string, SourceRule[]>();
const attachedSources = new Set<string>();
const sourceTypes = new Map<string, SourceType>();

let applyTargetDisplay: ApplyTargetDisplay | null = null;

export function initRegistry(apply: ApplyTargetDisplay): void {
  applyTargetDisplay = apply;
}

function getTargetKey(targets: target[]): string {
  return targets.map((t) => t.selector).join(",");
}

function getSourceTypeLabel(sourceType: SourceType): string {
  if (sourceType === "select") return "プルダウン";
  if (sourceType === "radio") return "ラジオボタン";
  return "チェックボックス";
}

export function registerSourceRule(source: source, targets: target[], sourceType: SourceType): void {
  const apply = applyTargetDisplay;
  if (!apply || !source.selector) return;

  const selector = source.selector;
  const targetKey = getTargetKey(targets);
  const values = source.values ?? [];

  if (values.length === 0) {
    const rules = (rulesBySource.get(selector) ?? []).filter((rule) => rule.targetKey !== targetKey);
    if (rules.length > 0) {
      rulesBySource.set(selector, rules);
    } else {
      rulesBySource.delete(selector);
    }
    apply(targets, false);
    debugLog("registry", "values空のためルールを削除し非表示", { selector, targetKey });
    return;
  }

  const regExp = new RegExp(`^(${values.join("|")})$`);
  const rules = (rulesBySource.get(selector) ?? []).filter((rule) => rule.targetKey !== targetKey);
  rules.push({ targetKey, regExp, values, targets });
  rulesBySource.set(selector, rules);
  sourceTypes.set(selector, sourceType);

  attachSourceHandler(selector, sourceType);
  evaluateAllRules(selector, sourceType);
}

export function evaluateAllRules(selector: string, sourceType?: SourceType): void {
  const apply = applyTargetDisplay;
  if (!apply) return;

  const type = sourceType ?? sourceTypes.get(selector);
  const rules = rulesBySource.get(selector) ?? [];
  if (!type || rules.length === 0) return;

  const evaluationResults: Array<{
    targetKey: string;
    expectedValues: string[];
    isMatch: boolean;
    targets: target[];
  }> = [];

  if (type === "select") {
    const sourceElement = document.querySelector(`[name="${selector}"]`) as HTMLSelectElement | null;
    const currentValue = sourceElement ? String(sourceElement.value) : "";
    const selectOptions = sourceElement
      ? Array.from(sourceElement.options).map((opt) => ({ value: opt.value, text: opt.text }))
      : [];

    for (const rule of rules) {
      const isMatch = rule.regExp.test(currentValue);
      apply(rule.targets, isMatch);
      evaluationResults.push({
        targetKey: rule.targetKey,
        expectedValues: rule.values,
        isMatch,
        targets: rule.targets,
      });
    }

    debugLog("registry", `${getSourceTypeLabel(type)}の全ルール評価`, {
      selector,
      currentValue,
      selectOptions,
      ruleCount: rules.length,
      evaluationResults,
    });
    return;
  }

  if (type === "radio") {
    const sourceElements = document.querySelectorAll(`[name="${selector}"]`) as NodeListOf<HTMLInputElement>;
    const radioOptions = Array.from(sourceElements).map((el) => ({
      value: el.value,
      label: el.labels?.[0]?.textContent?.trim() ?? el.closest("label")?.textContent?.trim() ?? null,
      checked: el.checked,
    }));
    const checkedElement = document.querySelector(`[name="${selector}"]:checked`) as HTMLInputElement | null;
    const checkedValue = checkedElement?.value ?? null;

    for (const rule of rules) {
      const isMatch = checkedElement ? rule.regExp.test(checkedElement.value) : false;
      apply(rule.targets, isMatch);
      evaluationResults.push({
        targetKey: rule.targetKey,
        expectedValues: rule.values,
        isMatch,
        targets: rule.targets,
      });
    }

    debugLog("registry", `${getSourceTypeLabel(type)}の全ルール評価`, {
      selector,
      checkedValue,
      radioOptions,
      ruleCount: rules.length,
      evaluationResults,
    });
    return;
  }

  const checkedElements = document.querySelectorAll(`[name="${selector}"]:checked`) as NodeListOf<HTMLInputElement>;
  const checkedValues = Array.from(checkedElements).map((element) => element.value);

  for (const rule of rules) {
    const isMatch = checkedValues.some((value) => rule.regExp.test(value));
    apply(rule.targets, isMatch);
    evaluationResults.push({
      targetKey: rule.targetKey,
      expectedValues: rule.values,
      isMatch,
      targets: rule.targets,
    });
  }

  debugLog("registry", `${getSourceTypeLabel(type)}の全ルール評価`, {
    selector,
    checkedValues,
    ruleCount: rules.length,
    evaluationResults,
  });
}

function attachSourceHandler(selector: string, sourceType: SourceType): void {
  if (attachedSources.has(selector)) return;
  attachedSources.add(selector);

  const handler = () => evaluateAllRules(selector, sourceType);

  if (sourceType === "select") {
    const sourceElement = document.querySelector(`[name="${selector}"]`) as HTMLSelectElement | null;
    if (sourceElement) {
      sourceElement.addEventListener("change", handler);
    }
    return;
  }

  const sourceElements = document.querySelectorAll(`[name="${selector}"]`) as NodeListOf<HTMLInputElement>;
  sourceElements.forEach((element) => {
    element.addEventListener("change", handler);
  });
}
