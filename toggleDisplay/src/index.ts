import type { selectorElement, source, target, toggleDisplay } from "./type";

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

// selectorからElementを取得する関数
function getSelectorElement(selector: string): selectorElement {
  const nameElm = document.querySelector(`[name="${selector}"]`);
  if (nameElm) return nameElm as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  // ファイル項目はIDで管理されてる
  const idElm = document.querySelector(`#file_view_${selector}`);
  if (idElm) return idElm as HTMLInputElement;
  // グループラベルは完全一致で調査
  const labelElms = document.querySelectorAll("li.label") as NodeListOf<HTMLLIElement>;
  const labelRegExp = new RegExp(`^${selector}$`); // 正規表現を許可する
  const labelElm = Array.from(labelElms).filter((e) => labelRegExp.test(e.innerText))[0];
  if (labelElm) return labelElm;
  return null;
}

// 要素の表示・非表示を切り替えする関数
function setTargetDisplay(targets: target[], isDisplay: boolean) {
  targets.forEach((target) => {
    const selector = target.selector;
    const required = target.required && isDisplay; // 非表示の場合はrequiredを強制的にfalseにする
    if (!selector) {
      console.error("[toggleDisplay] targetsのselectorは必須です", target);
      return;
    }
    const targetElm = getSelectorElement(selector);
    if (targetElm == null) {
      console.error("[toggleDisplay] targetsのselector要素が見つかりません", target);
      return;
    }
    // グループラベルはtargetElmを表示・非表示
    if (targetElm.className === "label") {
      targetElm.style.display = isDisplay ? "" : "none";
      return;
    }
    // targetElmの親要素を取得して表示・非表示
    const targetParentElm = targetElm.closest("li.clr") as HTMLLIElement;
    if (targetParentElm == null) {
      console.error("[toggleDisplay] targetsの親要素が見つかりません", target);
      return;
    }
    targetParentElm.style.display = isDisplay ? "" : "none";
    // label.col.span_3に.requiredを追加
    const labelElm = targetParentElm.querySelector("label.col.span_3") as HTMLLabelElement | null;
    if (labelElm) {
      labelElm.classList.toggle("required", required ?? false);
    }
    // 特定の要素のみ必須化
    const requiredElm = targetParentElm.querySelector('[type="number"], [type="password"], [type="radio"], [type="text"], select, textarea') as HTMLInputElement | HTMLSelectElement | null;
    if (requiredElm) {
      requiredElm.required = required ?? false;
    }
    // チェックボックスのみ監視した必須化
    const checkboxElms = Array.from(targetParentElm.querySelectorAll('[type="checkbox"]')) as HTMLInputElement[];
    // 既存のイベントリスナーを削除してから追加（重複防止）
    checkboxElms.forEach((element) => {
      // 同じ関数のリスナーを削除
      element.removeEventListener("change", (element as any)._toggleDisplayChangeHandler);
      // 新しいハンドラーを作成
      (element as any)._toggleDisplayChangeHandler = () => {
        const isChecked = targetParentElm.querySelector('[type="checkbox"]:checked') !== null;
        checkboxElms.forEach((elm) => (elm.required = !isChecked));
      };
      element.addEventListener("change", (element as any)._toggleDisplayChangeHandler);
    });
  });
}

// 表示・非表示の切り替え関数
export function toggleDisplay(object?: toggleDisplay) {
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
  const sourceElement = getSelectorElement(source.selector);
  if (sourceElement == null) {
    console.error("[toggleDisplay] sourceのselector要素が見つかりません", object);
    return;
  }
  // 住所セットの「都道府県 -pf 」と「市区町村 -ct 」のみ、プログラム変更後にイベントを強制発火する
  if (/wf\d+-(pf|ct)/.test(source.selector)) {
    // 既にvalueプロパティが再定義済みなら処理しない
    const descriptor = Object.getOwnPropertyDescriptor(sourceElement, "value");
    if (descriptor && descriptor.configurable === false) {
      return;
    }
    // suffix に応じて prototype を切り替え
    const isPf = source.selector.endsWith("-pf");
    const proto = isPf ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    // .prototype.valueのプロパティ記述子を取得
    const d = Object.getOwnPropertyDescriptor(proto, "value");
    if (d && d.set) {
      // sourceElementのvalueを上書き定義
      Object.defineProperty(sourceElement, "value", {
        get() {
          // 元々のgetterをそのまま呼び出す
          return d.get?.call(this);
        },
        set(v) {
          // 現在の値を取得
          const old = d.get?.call(this);
          // 元のsetterで実際の値を更新
          d.set?.call(this, v);
          // 値が実際に更新された後でchange/inputを発火
          const event = isPf ? "change" : "input";
          if (v !== old) this.dispatchEvent(new Event(event, { bubbles: true }));
        },
      });
    }
  }
  const sourceType = sourceElement.type;
  const sourceTagName = sourceElement.tagName.toLowerCase();
  const sourceId = sourceElement.id;
  // プルダウン
  if (sourceTagName === "select") {
    const values = source.values ? source.values : [];
    if (values.length > 0) {
      const regExp = new RegExp(`^(${values.join("|")})$`); // 正規表現を許可する
      // 初期値
      setTargetDisplay(targets, regExp.test(String(sourceElement.value)));
      // 入力イベント
      sourceElement.addEventListener("change", (event) => {
        const eventElement = event.target as HTMLSelectElement | null;
        setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
      });
    } else {
      // valuesが空の場合は常に非表示
      setTargetDisplay(targets, false);
    }
  }
  // ファイル
  else if (sourceTagName === "p" && /^file_view_/.test(sourceId)) {
    // 初期値
    setTargetDisplay(targets, false);
    // 監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const { target, type } = mutation;
        const { firstElementChild } = target as HTMLElement;
        const isDisplay = type === "childList" && firstElementChild ? true : false;
        setTargetDisplay(targets, isDisplay);
      });
    });
    // 監視オプションの設定
    const config = { childList: true, subtree: true };
    observer.observe(sourceElement, config);
  }
  // チェックボックス
  else if (sourceType === "checkbox") {
    const values = source.values ? source.values : [];
    if (values.length > 0) {
      const regExp = new RegExp(`^(${values.join("|")})$`); // 正規表現を許可する
      const setCheckedDisplay = () => {
        const checkedElements = document.querySelectorAll(`[name="${source.selector}"]:checked`) as NodeListOf<HTMLInputElement>;
        const checkedValues = Array.from(checkedElements).map((element) => element.value);
        const isDisplay = checkedValues.some((value) => regExp.test(value));
        setTargetDisplay(targets, isDisplay);
      };
      // 初期値
      setCheckedDisplay();
      // 入力イベント
      const sourceElements = document.querySelectorAll(`[name="${source.selector}"]`) as NodeListOf<HTMLInputElement>;
      sourceElements.forEach((element) => {
        element.addEventListener("change", (event) => {
          setCheckedDisplay();
        });
      });
    } else {
      // valuesが空の場合は常に非表示
      setTargetDisplay(targets, false);
    }
  }
  // ラジオボタン
  else if (sourceType === "radio") {
    const values = source.values ? source.values : [];
    if (values.length > 0) {
      const regExp = new RegExp(`^(${values.join("|")})$`); // 正規表現を許可する
      // 初期値
      const checkedElement = document.querySelector(`[name="${source.selector}"]:checked`) as HTMLInputElement | null;
      setTargetDisplay(targets, checkedElement ? regExp.test(checkedElement.value) : false);
      // 入力イベント
      const sourceElements = document.querySelectorAll(`[name="${source.selector}"]`) as NodeListOf<HTMLInputElement>;
      sourceElements.forEach((element) => {
        element.addEventListener("change", (event) => {
          const eventElement = event.target as HTMLInputElement | null;
          setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
        });
      });
    } else {
      // valuesが空の場合は常に非表示
      setTargetDisplay(targets, false);
    }
  }
  // 一行テキスト
  else {
    // 初期値
    setTargetDisplay(targets, String(sourceElement.value).length > 0);
    // 入力イベント
    sourceElement.addEventListener("input", (event) => {
      const eventElement = event.target as HTMLInputElement | null;
      setTargetDisplay(targets, eventElement ? String(eventElement.value).length > 0 : false);
    });
  }
}

// バージョン情報を取得する関数
export function getVersion(): string {
  return "{{VERSION}}";
}

// ブラウザで実行する場合はwindowオブジェクトにtoggleDisplay関数を追加する
if (typeof window !== "undefined") {
  (window as any).toggleDisplay = toggleDisplay;
  (window as any).toggleDisplayVersion = getVersion;
}
