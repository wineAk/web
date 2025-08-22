// 定数定義
export const SELECTORS = {
  LABEL: "li.label",
  CLR: "li.clr",
  LABEL_COL: "label.col.span_3",
  REQUIRED_ELEMENTS: '[type="number"], [type="password"], [type="radio"], [type="text"], select, textarea',
  CHECKBOX: '[type="checkbox"]',
  CHECKED: ':checked'
} as const;

export const EVENTS = {
  CHANGE: "change",
  INPUT: "input"
} as const;

export const PATTERNS = {
  WF_PF_CT: /wf\d+-(pf|ct)/,
  WF_PF: /-pf$/,
  WF_CT: /-ct$/,
  WF_NUMBER: /^wf\d+$/
} as const;

export const MESSAGES = {
  SOURCE_NOT_FOUND: "[toggleDisplay] ソースのセレクターが見つかりません",
  TARGET_NOT_FOUND: "[toggleDisplay] ターゲットのセレクターが見つかりません",
  PARENT_NOT_FOUND: "[toggleDisplay] ターゲットの親要素が見つかりません",
  INVALID_SOURCE: "[toggleDisplay] ソースの設定が不正です",
  INVALID_TARGETS: "[toggleDisplay] ターゲットの設定が不正です"
} as const;
