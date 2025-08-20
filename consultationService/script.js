moment.locale('ja', {
  weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
});
var reservationListObj = {};
var testMode = /test_mode=1/.test(window.location.search);
var version = window.navigator.appVersion.toLowerCase();
debug('load version', version);
debug('load jQuery.support', jQuery.support);
if (/msie\s?[0-9]\./.test(version)) alert(
  '申し訳ございません。\n\n' +
  'このブラウザでは当ページをご覧いただくことができません。\n' +
  'お手数ではございますが、最新のChrome・Edge・Firefox・IE11・Safariなどのブラウザにてご覧下さい。'
);
$(function() {
  // dataタグを付与
  $('li.clr').each(function() {
    var text = $(this).children('label').text();
    var dataTag = (function() {
      if (/名前/.test(text)) return 'name';
      if (/人数/.test(text)) return 'people';
      if (/相談内容/.test(text)) return 'content';
      if (/第\d希望/.test(text)) return 'select';
      if (/第\d日付/.test(text)) return 'date';
      if (/第\dテキスト/.test(text)) return 'text';
      return '';
    })();
    if (dataTag !== '') $(this).data(dataTag, true).attr('data-' + dataTag, true);
  });
  // 入力画面
  if ($('#seminar_form[data-input]').length) {
    debug('入力画面', true);
    $(document).on('change', '[data-select] select', function() {
      processingOfDesirableDate($(this).parents('[data-select]'));
    });
    $(document).on('keyup paste', '.placeholder textarea', function() {
      if ($(this).val().length) {
        $('.placeholder div').css('display', 'none');
      } else {
        $('.placeholder div').css('display', 'block');
      }
    });
    $(document).on('click', '.more button', function() {
      var name = $(this).attr('name');
      var changeAry = (function() {
        if (/open/.test(name)) return ['close', '↑ close'];
        return ['open', '↓ open'];
      })();
      //$('div[data-more]').data('more', name).attr('data-more', name);
      $(this).text(changeAry[1]).attr('name', changeAry[0]);
      $('[data-more=target]').slideToggle('slow');
      debug('more name', name);
      debug('more changeAry', changeAry);
    });
    // 各種書き込み
    if ($('[data-people] input').val() === '') $('[data-people] input').val('1');
    $('[data-select]').find('.span_9 .f_comt').prepend('<select name="date-select"><option value="" label="日付を選んで下さい">日付を選んで下さい</option></select>');
    $('[data-select]').wrapAll('<div data-loading="true" data-loading-error="false"><div class="loading-select"></div></div>');
    $('[data-loading]').append(
      '<div class="loading-overlay">' +
      '<div class="loading-overlay-now"><div><div></div><p>データを取得しています…</p></div></div>' +
      '<div class="loading-overlay-error"><div><div></div><p>データの取得に失敗しました<br>時間をおいて再度お試し下さい</p></div></div>' +
      '</div>'
    );
    // 予約一覧の処理
    var url = 'https://script.google.com/macros/s/AKfycbwca-miwVH7Tq54jcBN2IyfXm5tQoPseXjrywmfcdWkh2sl52l0/exec';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json'
      })
      .done(function(data, textStatus, jqXHR) {
        debug('done data', data);
        reservationListObj = data.reserve;
        // 希望日を作成
        var listsDate = getListsDate(data.date);
        var listsDateHtml = '';
        for (var key in listsDate) {
          var listDate = listsDate[key];
          var listsDateLabel = listDate.label;
          var listsDateData = listDate.data;
          var html = '<optgroup label="' + listsDateLabel + '">';
          for (var i = 0, n = listsDateData.length; i < n; i++) {
            var date = listsDateData[i].date;
            var format = listsDateData[i].format;
            var diff = listsDateData[i].diff;
            var tag = (function() {
              // 経過日数（一昨日2, 昨日1, 今日0, 明日-1, 明後日-2）
              if (diff >= -13) return 'disabled="disabled"';
              // 祝日
              if (data.holiday[date]) return 'disabled="disabled"';
              return '';
            })();
            // 曜日（日0, 月1, 火2, 水3, 木4, 金5, 土6）
            if (listsDateData[i].day === 5) html += '<option value="' + date + '" label="' + format + '" ' + tag + '>' + format + '</option>';
          }
          listsDateHtml += html + '</optgroup>';
        }
        $('[data-select] .span_9 .f_comt option').after(listsDateHtml);
        $('[data-select]').eq(0).find('select').prop('required', true);
        // 希望日を自動選択
        $('[data-date]').each(function(index) {
          var value = $(this).find('input').val();
          $('[data-select]').eq(index).find('select').val(value);
          debug('data-date index', index);
          debug('data-date value', value);
        });
        // ポップアップを非表示
        $('[data-loading]').data('loading', false).attr('data-loading', false);
        // 希望日の必須
        $('[data-select]').each(function() {
          processingOfDesirableDate(this);
        });
        for (var key in reservationListObj) {
          var date = reservationListObj[key];
          if (date['time-13'] && date['time-15']) {
            $('[name="date-select"]').find('option[value="' + key + '"]').each(function() {
              $(this).prop('disabled', true);
            });
          }
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        debug('fail jqXHR', jqXHR);
        debug('fail textStatus', textStatus);
        debug('fail errorThrown', errorThrown);
        $('[data-loading]').data('loading-error', true).attr('data-loading-error', true);
        // エラーを記載してあげる
        var json = JSON.stringify(jqXHR);
        $('.loading-overlay-error p').after('<p class="error-log">' + json + '<p>');
      })
      .always(function(datan) {});
  }
  if ($('#seminar_form[data-confirmation]').length) {
    debug('確認画面', true);
    // 希望日を表示
    $('[data-text]').each(function(index) {
      var dateText = $(this).find('.span_9').text().trim();
      if (dateText === '') return;
      var selectText = $('[data-select]').eq(index).find('.span_9').text().trim();
      $('[data-select]').eq(index).find('.span_9').text(dateText + ' ' + selectText);
      $('[data-select]').eq(index).find('.span_3').addClass('required');
      debug('data-text index', index);
      debug('data-text dateText', dateText);
      debug('data-text selectText', selectText);
    });
  }
});

function getListsDate(apiDate) {
  var nowDate = moment(apiDate).utc().utcOffset('+09:00').startOf('day');
  var addMonth = (function() {
    if (nowDate.date() > 20) return 3;
    return 2;
  })();
  var startDate = nowDate.clone().startOf('month');
  var endDate = nowDate.clone().add(addMonth, 'months').endOf('month');
  var diffDate = endDate.diff(startDate, 'days') + 1;
  var listDate = {};
  for (var i = 0; i < diffDate; i++) {
    var obj = {};
    var date = startDate.clone().add(i, 'days');
    var group = date.diff(startDate, 'month');
    var label = date.format('YY年M月');
    obj.date = date.format('YYYY/MM/DD');
    obj.format = date.format('YYYY年MM月DD日(ddd)');
    obj.diff = nowDate.diff(date, 'days');
    obj.day = date.day();
    if (!listDate[group]) {
      listDate[group] = {};
      listDate[group].data = [];
      listDate[group].label = label;
    }
    listDate[group].data.push(obj);
  }
  debug('nowDate', nowDate.format('YYYY年MM月DD日(ddd)'));
  debug('startDate', startDate.format('YYYY年MM月DD日(ddd)'));
  debug('endDate', endDate.format('YYYY年MM月DD日(ddd)'));
  debug('diffDate', diffDate);
  debug('listDate', listDate);
  return listDate;
}

function processingOfDesirableDate(trg) {
  var index = $('[data-select]').index(trg);
  var checked = $(trg).find('input:checked').prop('checked');
  var selectedVal = (function() {
    var v = $(trg).find('select').val();
    if (v == null) return '';
    return v;
  })();
  $('[data-date]').eq(index).find('input').val(selectedVal);
  debug('click index', index);
  debug('click checked', checked);
  debug('click selectedVal', selectedVal);
  if (selectedVal.length) {
    $(trg).children('label').addClass('required');
    $(trg).find('select').prop('required', true);
    $(trg).find('input').prop('disabled', false);
    $(trg).find('input').eq(2).prop('required', true);
    var selectedObj = reservationListObj[selectedVal];
    var dateFormat = moment(selectedVal.replace(/\//g, '-')).format('YYYY年MM月DD日(ddd)');
    $('[data-text]').eq(index).find('input').val(dateFormat);
    debug('data-date dateFormat', dateFormat);
    debug('click selectedObj', selectedObj);
    if (selectedObj != null) {
      if (selectedObj['time-13']) $(trg).find('input').eq(0).prop('disabled', true).prop('checked', false);
      if (selectedObj['time-15']) $(trg).find('input').eq(1).prop('disabled', true).prop('checked', false);
    }
  } else {
    $(trg).children('label').removeClass('required');
    $(trg).find('select').prop('required', false);
    $(trg).find('input').prop('required', false).prop('disabled', true);
    $('[data-text]').eq(index).find('input').val('');
  }
  if (index === 0) {
    $(trg).children('label').addClass('required');
    $(trg).find('select').prop('required', true);
  }
}

function debug(message, data) {
  if (testMode) console.log(message, data);
}