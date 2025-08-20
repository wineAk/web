

/**
 * 配列のtrgからHTMLLIElementを取得して、elmに追加して返却する関数
 */
function getElements(options) {
  const getLiClrElement = (name) => {
    const nameElm = document.querySelector(`[name=${name}]`);
    const idElm = document.querySelector(`#${name}`);
    if (nameElm) return nameElm.closest("li.clr");
    if (idElm) return idElm.closest("li.clr");
    return null;
  };
  const getLiLabelElement = (text) => {
    const labelElms = document.querySelectorAll(
      "li.label"
    ) as NodeListOf<HTMLLIElement>;
    const labelElm = Array.from(labelElms).filter(
      (e) => e.innerText === text
    )[0];
    return labelElm;
  };
  const newArray = options.map((object) => {
    const { trg } = object;
    const isWf = /^wf\d+$/.test(trg);
    const elm = isWf ? getLiClrElement(trg) : getLiLabelElement(trg);
    return { ...object, elm };
  });
  return newArray;
}



interface source {
  selector: string;
  values?: string[];

}
interface target {
  selector: string;
  required?: boolean;
}

interface toggleDisplay {
  source: source;
  targets: target[]
}

function getSourceElement(selector) {
  const nameElm = document.querySelector(`[name=${selector}]`);
  const idElm = document.querySelector(`#${selector}`);
  if (nameElm) return nameElm;
  if (idElm) return idElm;
  return null;
}

function toggleDisplay(object) {
  const { source, targets } = object;
  const sourceElm = getSourceElement(source.selector)
  console.log('toggleDisplay - sourceElm:', sourceElm)
  if (sourceElm == null) return
  const sourceType = sourceElm.type
  const sourceTagName = sourceElm.tagName.toLowerCase()
  console.log('toggleDisplay - sourceType:', sourceType)
  console.log('toggleDisplay - sourceTagName:', sourceTagName)
  const sourceValues = source.values ? source.values : []
  const sourceSelectors = sourceValues.map(value => {
    if (sourceTagName === "select") return `[name="${source.selector}"] > [value="${value}"]`;
    if (sourceType === "file") return `#${source.selector}`
    if (value === "") return `[name="${source.selector}"]`
    return `[name="${source.selector}"][value="${value}"]`
  })
  console.log('toggleDisplay - sourceSelectors:', sourceSelectors)
  const sourceElms = sourceSelectors.map(selector => document.querySelector(selector))
  console.log('toggleDisplay - sourceElms:', sourceElms)
}

// 一行テキスト
toggleDisplay({
  source: { selector: "wf49669194001" },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});
// 複数行テキスト
toggleDisplay({
  source: { selector: "wf49669194003" },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});
// チェックボックス
toggleDisplay({
  source: { selector: "wf49669194005", values: [ "B", "C" ] },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});
// ラジオボタン
toggleDisplay({
  source: { selector: "wf49669194008", values: [ "B", "C" ] },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});
// プルダウン
toggleDisplay({
  source: { selector: "wf49669194010", values: [ "B", "C" ] },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});
// ファイル
toggleDisplay({
  source: { selector: "wf49669194016" },
  targets: [
    { selector: "wf49669194011", required: false },
  ],
});



  // `[name=${selector}]` or `#${selector}`
  // 一行テキスト     [name]
  // 複数行テキスト   [name]
  // チェックボックス [name & values]
  // ラジオボタン     [name & values]
  // プルダウン       [name > values]
  // ファイル         [id]