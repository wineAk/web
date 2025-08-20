// 選択によって表示・非表示を切り替えるスクリプト
document.addEventListener('DOMContentLoaded', _ => {

  /**
   * 要素の表示切り替え関数
   * @param {{trg: string, elm: HTMLLIElement, req: boolean, reg?: string}} object - オブジェクト
   * @param {boolean} display - 表示させるか否か
   */
  const toggleDisplay = (object, display) => {
    const { elm, req } = object
    if (elm == null) return
    const labelElm = elm.querySelector('label.col.span_3')
    if (display) {
      // 項目を表示
      elm.style.display = ''
      // 必須を追加
      if (req && labelElm) labelElm.classList.add('required')
    } else {
      // 項目を非表示
      elm.style.display = 'none'
      // 必須を削除
      if (req && labelElm) labelElm.classList.remove('required')
    }
    const inputElm = elm.querySelector('[type="number"], [type="radio"], [type="text"], select')
    // 必須にしたくない項目が存在するので対処
    const required = (_ => {
      // inputElmがない場合は必須にしない
      if (inputElm == null) return false
      // data-requiredがfalseの場合は必須にしない
      const required = inputElm.dataset.required
      if (required && required.toLowerCase() === 'false') return false
      // それ以外は必須にする
      return true
    })()
    if (display) {
      if (req && required) inputElm.required = true
    } else {
      if (req && required) inputElm.required = false
    }
  }

  /**
   * 配列のtrgからHTMLLIElementを取得して、elmに追加して返却する関数
   * 
   * @param {Array<{trg: string, req: boolean, reg?: string}>} options - 設定オブジェクトの配列
   * @returns {Array<{trg: string, elm: HTMLLIElement, req: boolean, reg?: string}>} - 設定オブジェクトの配列
   */
  const getElements = (options) => {
    /**
     * name属性から、入力項目のli.clr要素を取得
     * @param {string} name - inputのname属性
     * @returns {HTMLLIElement | null} - li.clr要素
     */
    const getLiClrElement = (name) => {
      const nameElm = document.querySelector(`[name=${name}]`)
      const idElm = document.querySelector(`#${name}`)
      const elm = nameElm ? nameElm.closest('li.clr') : idElm.closest('li.clr')
      return elm
    }
    /**
     * innerTextから、グループラベルのli.label要素を取得
     * @param {string} text - グループラベルのテキスト
     * @returns {HTMLLIElement | null} - li.label要素
     */
    const getLiLabelElement = (text) => {
      const labelElms = document.querySelectorAll('li.label')
      const labelElm = Array.from(labelElms).filter(e => e.innerText === text)[0]
      return labelElm
    }
    // trgからHTMLLIElementを取得
    const newArray = options.map(object => {
      const { trg } = object
      const elm = /^wf\d+$/.test(trg) ? getLiClrElement(trg) : getLiLabelElement(trg)
      return { ...object, elm }
    })
    return newArray
  }

  /**
   * 一行テキスト用の関数
   * @param {string} name - inputのname属性
   * @param {Array<{trg: string, req: boolean}>} options - 設定オブジェクトの配列
   */
  const toggleDisplayText = (name, options) => {
    const array = getElements(options)
    // 処理
    const action = (value) => array.forEach(obj => toggleDisplay(obj, value.length > 0))
    // 初期は全て非表示
    array.forEach(obj => toggleDisplay(obj))
    // 戻るなどで初期状態が変わってる事があるので処理を行う
    action(document.querySelector(`[name=${name}]`).value)
    // 処理を行うイベントリスナーを設定
    document.querySelector(`[name=${name}]`).addEventListener('input', event => action(event.target.value))
  }

  /**
   * ラジオボタン用の関数
   * @param {string} name - inputのname属性
   * @param {string} text - 正規表現
   * @param {Array<{trg: string, req: boolean}>} options - 設定オブジェクトの配列
   */
  const toggleDisplayRadio = (name, text, options) => {
    const array = getElements(options)
    const reg = new RegExp(`^(${text})$`)
    // 処理
    const action = () => {
      const checked = document.querySelector(`[name=${name}]:checked`)
      const display = checked ? reg.test(checked.value) : false
      array.forEach(obj => toggleDisplay(obj, display))
    }
    // 初期は全て非表示
    array.forEach(obj => toggleDisplay(obj))
    // 戻るなどで初期状態が変わってる事があるので処理を行う
    action()
    // 処理を行うイベントリスナーを設定
    document.querySelectorAll(`[name=${name}]`).forEach(elm => elm.addEventListener('change', () => action()))
  }

  /**
   * プルダウン用の関数
   * @param {string} name - inputのname属性
   * @param {string} text - 正規表現
   * @param {Array<{trg: string, req: boolean}>} options - 設定オブジェクトの配列
   */
  const toggleDisplaySelect = (name, text, options) => {
    const array = getElements(options)
    const reg = new RegExp(`^(${text})$`)
    // 処理
    const action = (value) => array.forEach(obj => toggleDisplay(obj, reg.test(value)))
    // 初期は全て非表示
    array.forEach(obj => toggleDisplay(obj))
    // 戻るなどで初期状態が変わってる事があるので処理を行う
    action(document.querySelector(`[name=${name}]`).value)
    // イベントリスナーを設定
    document.querySelector(`[name=${name}]`).addEventListener('change', event => action(event.target.value))
  }

  /**
   * チェックボックス用の関数
   * @param {string} name - inputのname属性
   * @param {Array<{trg:string, req: boolean, reg: string}>} array - 設定オブジェクトの配列
   */
  const toggleDisplayCheckbox = (name, options) => {
    const array = getElements(options)
    // 処理
    const action = () => {
      // チェックがついた要素を対象にする
      document.querySelectorAll(`[name=${name}]:checked`).forEach(elm => {
        // 設定に一致した要素のみ表示
        array.forEach(obj => {
          const reg = new RegExp(`^(${obj.reg})$`)
          if (reg.test(elm.value)) toggleDisplay(obj, true)
        })
      })
    }
    // 初期は全て非表示
    array.forEach(obj => toggleDisplay(obj))
    // 戻るなどで初期状態が変わってる事があるので処理を行う
    action()
    // 処理を行うイベントリスナーを設定
    document.querySelectorAll(`[name=${name}]`).forEach(elm => {
      elm.addEventListener('change', () => {
        // 全て非表示
        array.forEach(obj => toggleDisplay(obj))
        // 処理
        action()
      })
    })
  }

  const toggleDisplayFile = (name, options) => {
    const array = getElements(options)
    console.log('toggleDisplayFile - array:', array)
    // 初期は全て非表示
    array.forEach(obj => toggleDisplay(obj))
    const action = (value) => array.forEach(obj => toggleDisplay(obj, value))
    // 監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const { target, type } = mutation
        const { firstElementChild } = target
        const isDisplay =  (type === "childList" && firstElementChild) 
        action(isDisplay)
      });
    });
    const elm = document.querySelector(`#file_view_${name}`)
    // 監視オプションの設定
    const config = { childList: true, subtree: true };
    observer.observe(elm, config)
  }
  toggleDisplayFile('wf49669194016', [
    { trg: 'wf49669194017', req: false, },
  ])
})