// Datepickerで入力された際はinputイベントを発火させる
// @ts-ignore
jQuery.datepicker.setDefaults({
  onSelect: function (dateText, inst) {
    const input = inst && inst.input && inst.input.get(0);
    if (input) {
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
});

type selectorElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLLIElement | null;

type source = {
  selector: string;
  values?: string[];
};

type target = {
  selector: string;
  required?: boolean;
};

type toggleDisplay = {
  source: source;
  targets: target[];
};

// selectorからElementを取得する関数
function getSelectorElement(selector: string): selectorElement {
  const nameElm = document.querySelector(`[name="${selector}"]`);
  if (nameElm) return nameElm as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  // ファイル項目はIDで管理されてる
  const idElm = document.querySelector(`#file_view_${selector}`);
  if (idElm) return idElm as HTMLInputElement;
  // グループラベルは完全一致で調査
  const labelElms = document.querySelectorAll("li.label") as NodeListOf<HTMLLIElement>;
  const labelElm = Array.from(labelElms).filter((e) => e.innerText === selector)[0];
  if (labelElm) return labelElm;
  return null;
}

// 要素の表示・非表示を切り替えする関数
function setTargetDisplay(targets: target[], isDisplay: boolean) {
  targets.forEach((target) => {
    const selector = target.selector;
    const required = target.required && isDisplay; // 非表示の場合はrequiredを強制的にfalseにする
    const targetElm = getSelectorElement(selector);
    if (targetElm == null) {
      console.error("[toggleDisplay] ターゲットのセレクターが見つかりません", selector);
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
      console.error("[toggleDisplay] ターゲットの親要素が見つかりません", selector);
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
    checkboxElms.forEach((element) => {
      element.addEventListener("change", () => {
        const isChecked = targetParentElm.querySelector('[type="checkbox"]:checked') !== null;
        checkboxElms.forEach((elm) => elm.required = !isChecked);
      });
    });
  });
}

// 表示・非表示の切り替え関数
export function toggleDisplay(object: toggleDisplay) {
  const { source, targets } = object;
  const sourceElement = getSelectorElement(source.selector);
  if (sourceElement == null) {
    console.error("[toggleDisplay] ソースのセレクターが見つかりません", source.selector);
    return;
  }
  // 住所セットの「都道府県 -pf 」と「市区町村 -ct 」のみ、プログラム変更後にイベントを強制発火する
  if (/wf\d+-(pf|ct)/.test(source.selector)) {
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
    const regExp = new RegExp(`^(${values.join("|")})$`);
    // 初期値
    setTargetDisplay(targets, regExp.test(String(sourceElement.value)));
    // 入力イベント
    sourceElement.addEventListener("change", (event) => {
      const eventElement = event.target as HTMLSelectElement | null;
      setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
    });
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
    const regExp = new RegExp(`^(${values.join("|")})$`);
    const setCheckedDisplay = () => {
      const checkedElements = document.querySelectorAll(`[name=${source.selector}]:checked`) as NodeListOf<HTMLInputElement>;
      const checkedValues = Array.from(checkedElements).map((element) => element.value);
      const isDisplay = checkedValues.some((value) => regExp.test(value));
      setTargetDisplay(targets, isDisplay);
    };
    // 初期値
    setCheckedDisplay();
    // 入力イベント
    const sourceElements = document.querySelectorAll(`[name=${source.selector}]`) as NodeListOf<HTMLInputElement>;
    sourceElements.forEach((element) => {
      element.addEventListener("change", (event) => {
        setCheckedDisplay();
      });
    });
  }
  // ラジオボタン
  else if (sourceType === "radio") {
    const values = source.values ? source.values : [];
    const regExp = new RegExp(`^(${values.join("|")})$`);
    // 初期値
    const checkedElement = document.querySelector(`[name=${source.selector}]:checked`) as HTMLInputElement | null;
    setTargetDisplay(targets, checkedElement ? regExp.test(checkedElement.value) : false);
    // 入力イベント
    const sourceElements = document.querySelectorAll(`[name=${source.selector}]`) as NodeListOf<HTMLInputElement>;
    sourceElements.forEach((element) => {
      element.addEventListener("change", (event) => {
        const eventElement = event.target as HTMLInputElement | null;
        setTargetDisplay(targets, eventElement ? regExp.test(eventElement.value) : false);
      });
    });
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

// ブラウザで実行する場合はwindowオブジェクトにtoggleDisplay関数を追加する
if (typeof window !== "undefined") {
  (window as any).toggleDisplay = toggleDisplay;
}

/*
// 一行テキスト
toggleDisplay({
  source: {
    selector: "wf23546447001",
  },
  targets: [
    { selector: "一行" },
    { selector: "wf23546447002", required: false }
  ],
});
// 複数行テキスト
toggleDisplay({
  source: {
    selector: "wf23546447003",
  },
  targets: [
    { selector: "複数行" },
    { selector: "wf23546447004", required: false }
  ],
});
// チェックボックス
toggleDisplay({
  source: {
    selector: "wf23546447005",
    values: ["B", "C"],
  },
  targets: [
    { selector: "チェック" },
    { selector: "wf23546447006", required: false }
  ],
});
// ラジオボタン
toggleDisplay({
  source: {
    selector: "wf23546447007",
    values: ["B", "C"],
  },
  targets: [
    { selector: "ラジオ" },
    { selector: "wf23546447008", required: false }
  ],
});
// プルダウン
toggleDisplay({
  source: {
    selector: "wf23546447009",
    values: ["B", "C"],
  },
  targets: [
    { selector: "プル" },
    { selector: "wf23546447010", required: false }
  ],
});
// 日付
toggleDisplay({
  source: {
    selector: "wf23546447011",
  },
  targets: [
    { selector: "日付" },
    { selector: "wf23546447012", required: false }
  ],
});
// 数字
toggleDisplay({
  source: {
    selector: "wf23546447013",
  },
  targets: [
    { selector: "数字" },
    { selector: "wf23546447014", required: false }
  ],
});
// ファイル
toggleDisplay({
  source: {
    selector: "wf23546447015",
  },
  targets: [
    { selector: "ファイル" },
    { selector: "wf23546447016", required: false }
  ],
});
// 住所セット（都道府県）
toggleDisplay({
  source: {
    selector: "wf23546447017-pf",
    values: [".*[都道府]"],
  },
  targets: [
    { selector: "住所" },
    { selector: "wf23546447018-pf", required: false }
  ],
});
// 住所セット（市区町村）
//toggleDisplay({
//  source: {
//    selector: "wf23546447017-ct",
//  },
//  targets: [
//    { selector: "住所" },
//    { selector: "wf23546447018-ct", required: false }
//  ],
//});
// パスワード
toggleDisplay({
  source: {
    selector: "wf23546447019",
  },
  targets: [
    { selector: "パス" },
    { selector: "wf23546447020", required: false }
  ],
});
*/
