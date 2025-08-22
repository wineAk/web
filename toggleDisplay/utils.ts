import { SELECTORS, PATTERNS } from './constants';

// 要素の存在チェック
export function elementExists(selector: string): boolean {
  return document.querySelector(selector) !== null;
}

// セレクターからElementを取得する関数
export function getSelectorElement(selector: string) {
  const nameElm = document.querySelector(`[name="${selector}"]`);
  if (nameElm) return nameElm as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  
  // ファイル項目はIDで管理されてる
  const idElm = document.querySelector(`#file_view_${selector}`);
  if (idElm) return idElm as HTMLInputElement;
  
  // グループラベルは完全一致で調査
  const labelElms = document.querySelectorAll(SELECTORS.LABEL) as NodeListOf<HTMLLIElement>;
  const labelElm = Array.from(labelElms).filter((e) => e.innerText === selector)[0];
  if (labelElm) return labelElm;
  
  return null;
}

// 住所セットかどうかチェック
export function isAddressSet(selector: string): boolean {
  return PATTERNS.WF_PF_CT.test(selector);
}

// 都道府県かどうかチェック
export function isPrefecture(selector: string): boolean {
  return PATTERNS.WF_PF.test(selector);
}

// WF番号かどうかチェック
export function isWfNumber(selector: string): boolean {
  return PATTERNS.WF_NUMBER.test(selector);
}

// 安全な文字列変換
export function safeString(value: any): string {
  return String(value || '');
}

// 正規表現の安全な作成
export function createSafeRegex(values: string[]): RegExp {
  const escapedValues = values.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`^(${escapedValues.join("|")})$`);
}
