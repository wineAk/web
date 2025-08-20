// サービス
const service = [{
    'id': 'lead',
    'list': 'Lead',
    'button': 'Lead',
    'color': 'rgba(142, 168, 0, 1)'
  },
  {
    'id': 'sales',
    'list': 'Sales',
    'button': 'Sales',
    'color': 'rgba(13, 123, 166, 1)'
  },
  {
    'id': 'teleapo',
    'list': 'テレアポ職人',
    'button': 'テレアポ',
    'color': 'rgba(68, 157, 49, 1)'
  },
  {
    'id': 'form',
    'list': 'WEBフォーム',
    'button': 'フォーム',
    'color': 'rgba(180, 108, 213, 1)'
  },
  {
    'id': 'tracking',
    'list': 'WEB行動解析',
    'button': '行動解析',
    'color': 'rgba(233, 138, 75, 1)'
  },
  {
    'id': 'cti',
    'list': 'CloudCTI',
    'button': 'CTI',
    'color': 'rgba(0, 196, 196, 1)'
  },
  {
    'id': 'scan',
    'list': 'CloudScan',
    'button': 'Scan',
    'color': 'rgba(206, 53, 53, 1)'
  },
  {
    'id': 'api',
    'list': 'API',
    'button': 'API',
    'color': 'rgba(78, 132, 196, 1)'
  },
  {
    'id': 'works',
    'list': 'Works',
    'button': 'Works',
    'color': '125deg, #80BC2D 3%, #5087E8, #B392E6, #FF83CC, #FC5F60, #F49700'
  }
];
// ターゲット
const target = {
  'sales_person': 'wf21845574027', // 主担当
  'sales_person_email': 'wf21845574025', // メールアドレス
  // ご契約者情報
  'membership_type': 'wf21845574052', // 会員種別
  // アカウント情報1
  'login_id': 'wf21845574010', // ログインID
  'login_password': 'wf21845574011', // パスワード
  // アカウント情報2
  'account_paid': 'wf21845574016', // 有料アカウント数
  'account_free': 'wf21845574017', // 無料アカウント数
  'account_num': 'wf21845574028', // (アカウント合計数)
  'account_fee': 'wf21845574015', // アカウント料金
  'account_fee_sum': 'wf21845574029', // (アカウント料金 合計)
  // 契約情報1
  'trial_period': 'wf21845574020', // お試し期間
  'method_payment': 'wf21845574021', // 支払い
  'contract_period_start': 'wf21845574022-1', // 契約期間（開始日）
  'contract_period_end': 'wf21845574022-2', // 契約期間（終了日）
  // 契約情報2
  'service_fee_sum': 'wf21845574024', // (サービス料金 合計)
  // その他
  'tax_rate': 'wf21845574055', // 税率
  'saaske_fee': 'wf21845574044', // サスケ 合計
  'saaske_fee_tax': 'wf21845574049' // サスケ 合計 税込み
};
// パスワード生成
function registerPassword() {
  const passNum = removeNonNumber($('#password input[name=num]').val());
  let password = '';
  let string = 'abcdefghijklmnopqrstuvwxyz';
  if ($('#password input[name=number]').prop('checked')) string += '0123456789';
  if ($('#password input[name=bigger]').prop('checked')) string += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < passNum; i++) password += string.charAt(Math.floor(Math.random() * string.length));
  $(`[name=${target['login_password']}]`).val(password);
}
// 来月の日付を登録
function registerNextMonthDate() {
  const nowDate = new Date();
  const nowYear = nowDate.getFullYear();
  const nowMonth = nowDate.getMonth() + 1;
  const nowDay = nowDate.getDate();
  const setYear = (function() {
    if (nowMonth === 12) return nowYear + 1;
    return nowYear;
  })();
  const setMonth = (function() {
    if (nowMonth === 12) return 1;
    return nowMonth + 1;
  })();
  const setDay = (function() {
    const lastDay = new Date(setYear, setMonth, 0).getDate(); // 0日目=その月の最終日となる
    if (nowDay > lastDay) return lastDay; // 「今日の日付(31日)」が「翌月の末日(28日)」より大きいとき、翌月の末日の日付を指定する
    return nowDay;
  })();
  $(`[name=${target['trial_period']}]`).val(`${setYear}/${setMonth}/${setDay}`);
}
// 自動計算処理
function automaticCalculation() {
  // アカウント情報2
  const account_paid = removeNonNumber($(`[name=${target['account_paid']}]`).val()); // 有料アカウント数
  const account_free = removeNonNumber($(`[name=${target['account_free']}]`).val()); // 無料アカウント数
  $(`[name=${target['account_num']}]`).val(account_paid + account_free); // (アカウント合計数)
  const account_fee = removeNonNumber($(`[name=${target['account_fee']}]`).val()); // アカウント料金
  $(`[name=${target['account_fee_sum']}]`).val(account_paid * account_fee); // (アカウント料金 合計)
  // 契約情報2
  let service_fee = 0;
  $('.service-list').each(function() {
    // .service-list-planを持ってない要素にあるinput（=各サービスの金額）だけ足していく
    if (!$(this).hasClass('service-list-plan')) service_fee += removeNonNumber($(this).find('input').val());
  });
  $(`[name=${target['service_fee_sum']}]`).val(service_fee);
  // その他
  const account_fee_sum = removeNonNumber($(`[name=${target['account_fee_sum']}]`).val()); // (アカウント料金 合計)
  const service_fee_sum = removeNonNumber($(`[name=${target['service_fee_sum']}]`).val()); // (サービス料金 合計)
  $(`[name=${target['saaske_fee']}]`).val(account_fee_sum + service_fee_sum); // サスケ 合計
  const saaske_fee = removeNonNumber($(`[name=${target['saaske_fee']}]`).val()); // サスケ 合計
  $(`[name=${target['saaske_fee_tax']}]`).val(taxCalculation(saaske_fee)); // サスケ 合計 税込み
}
// 消費税計算 (切り捨てfloor, 切り上げceil, 四捨五入round)
function taxCalculation(price) {
  const taxVal = $(`[name=${target['tax_rate']}]:checked`).val();
  const tax = 1 + removeNonNumber(taxVal) / 100;
  const taxIncluded = Math.floor(price * tax);
  return taxIncluded;
}
// 数字以外を除去
function removeNonNumber(str) {
  if (str == null || str === '') return 0;
  const rep = str.replace(/[^0-9]/g, '');
  const num = Number(rep);
  return num;
}
// 有料・無料選択の切り替え処理
function switchMembershipType() {
  const val = $(`[name=${target['membership_type']}]:checked`).val();
  $(`[name=${target['trial_period']}]`).prop('disabled', true);
  $(`[name=${target['method_payment']}]`).prop('disabled', true).prop('checked', false);
  $(`[name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).prop('disabled', true);
  $(`[name=${target['trial_period']}], [name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).next('.ui-datepicker-trigger').css('display', 'none');
  if (val == null) {
    $(`[name=${target['trial_period']}]`).val('');
    $(`[name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).val('');
  } else if (/無料/.test(val)) {
    registerNextMonthDate();
    $(`[name=${target['trial_period']}]`).prop('disabled', false);
    $(`[name=${target['method_payment']}]:eq(2)`).prop('disabled', false).prop('checked', true);
    $(`[name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).val('');
    $(`[name=${target['trial_period']}]`).next('.ui-datepicker-trigger').css('display', 'inline');
  } else if (/有料/.test(val)) {
    $(`[name=${target['trial_period']}]`).val('');
    $(`[name=${target['method_payment']}]:eq(0)`).prop('disabled', false).prop('checked', true);
    $(`[name=${target['method_payment']}]:eq(1)`).prop('disabled', false);
    $(`[name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).prop('disabled', false);
    $(`[name=${target['contract_period_start']}], [name=${target['contract_period_end']}]`).next('.ui-datepicker-trigger').css('display', 'inline');
  }
}
// 必須項目にする
function requiredTrialPeriod() {
  const val = $(`[name=${target['membership_type']}]:checked`).val();
  const required = /無料/.test(val); // 無料なら必須（true）
  //const required = $(`[name=${target['trial_period']}]`).prop('required');
  const $label = $(`[name=${target['trial_period']}]`).parent().prev();
  $(`[name=${target['trial_period']}]`).prop('required', required); // inputの必須を切り替える
  (required) ? $label.addClass('required') : $label.removeClass('required'); // CSSの必須を切り替える
}
// --------------------
// 各種処理
// --------------------
$(window).load(function() {
  // IE以外は注意文を非表示
  const ua = window.navigator.userAgent;
  if (!/Trident/.test(ua)) $('#ie_alert').addClass('display_none');
  // style＆製品ボタンを書き出す
  let styleHtml = '';
  let buttonHtml = '';
  for (let i = 0, n = service.length; i < n; i++) {
    const id = service[i].id;
    const btn = service[i].button;
    const clr = service[i].color;
    if (id === 'works') {
      styleHtml += `[data-service="${id}"]{background:linear-gradient(${clr});}`;
    } else {
      styleHtml += `[data-service="${id}"]{background-color:${clr};}`;
    }
    buttonHtml += `<div data-service="${id}">${btn}</div>`;
  }
  $('head').append(`<style>${styleHtml}</style>`);
  $('#service').append(buttonHtml);
  // サービス毎にClassを降る
  $('.clr').each(function() {
    const labelText = $(this).find('label.col.span_3').text();
    const labelTextRep = labelText.replace(/\s|：(金額|プラン)/g, '');
    const serviceName = (function() {
      for (let i = 0, n = service.length; i < n; i++) {
        const list = service[i].list;
        if (labelTextRep === list) return service[i].id;
      }
      return null;
    })();
    if (serviceName == null) {
      if (/合計/.test(labelText)) $(this).addClass('sum-list');
      if (/アカウント/.test(labelText)) $(this).attr('data-service', '').addClass('account-list');
    } else {
      $(this).data('service', serviceName).attr('data-service', serviceName).addClass('service-list');
      if (/プラン/.test(labelText)) $(this).addClass('service-list-plan');
      // input/select/radioに記入あったら表示させておく
      const inputVal = $(this).find('input').val() || '';
      const selectVal = $(this).find('select').val() || '';
      const radioVal = $(this).find('input[type="radio"]:checked').val() || '';
      const isVal = inputVal + selectVal + radioVal;
      if (isVal !== '') $(`[data-service=${serviceName}].service-list`).css('display', 'list-item');
    }
  });
  if ($('#input-page').length) {
    // 合計を表示させる場所はreadonlyに
    $(`[name=${target['account_num']}], [name=${target['account_fee_sum']}], [name=${target['service_fee_sum']}], [name=${target['saaske_fee']}], [name=${target['saaske_fee_tax']}]`).prop('readonly', true);
    // 諸々初回処理
    automaticCalculation();
    registerPassword();
    switchMembershipType();
    requiredTrialPeriod();
  }
  // 自動計算
  $('.form_list input').on('input keyup blur', function() {
    automaticCalculation();
  });
  // パスワード
  $('#password input[type=button]').on('click', function() {
    registerPassword();
  });
  // 1ヶ月後
  $('#next_month').on('click', function() {
    const val = $(`[name=${target['membership_type']}]:checked`).val();
    if (/無料/.test(val)) registerNextMonthDate();
  });
  // 無料・有料会員
  $(`[name=${target['membership_type']}]`).on('click', function() {
    switchMembershipType();
    requiredTrialPeriod();
  });
  // 税率
  $(`[name=${target['tax_rate']}]`).on('click', function() {
    automaticCalculation();
  });
  // 製品ボタン
  $('#service div').on('click', function() {
    const serviceName = $(this).data('service');
    const targetDom = $(`[data-service=${serviceName}].service-list`);
    const findInput = targetDom.find('input');
    const findSelect = targetDom.find('select');
    if (targetDom.data('open')) {
      targetDom.data('open', false);
      findInput.val('');
      findSelect.val('');
    } else {
      targetDom.data('open', true);
      if (findInput.val() === '') findInput.val('1');
      if (findSelect.val() === '') findSelect.val(findSelect.find('option').eq(1).val());
    }
    targetDom.stop(true, true).fadeToggle(1000); // 入力フォームの開閉
    automaticCalculation(); // 自動計算処理
  });
  // メールアドレス
  $(`[name=${target['sales_person_email']}]`).val('@interpark.co.jp') // 初期値
  $(`[name=${target['sales_person']}]`).on('change', function() {
    const val = $(this).val();
    const match = val.match(/<(.*)>/)
    const mail = (match == null) ? '@interpark.co.jp' : match[1]
    //const txt = email[val];
    //const mail = `${txt}@interpark.co.jp`;
    $(`[name=${target['sales_person_email']}]`).val(mail);
  });
  // 数字
  $('.account-list input').on('input keyup blur', function() {
    const val = $(this).val();
    const rep = val.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).replace(/[^0-9]/g, '').replace(/^0([0-9]+)/g, '$1');
    $(this).val(rep);
  });
});