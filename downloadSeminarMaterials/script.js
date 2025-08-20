$(function() {
  // Classを付与
  $('li.clr').each(function() {
    var trg = $(this).children('label').text();
    if (/希望資料/g.test(trg)) $(this).addClass('document');
  });
  // settingを元に設定
  for (var i = 0, n = setting.length; i < n; i++) {
    table(setting[i]); // 資料テーブルを生成
    checkbox(setting[i]); // 項目の名称を変更
  }
  $('.button').on('click', function() {
    // nameが無いときは処理しない
    var name = $(this).data('name');
    if (name == null || name == '') return;
    // 入力フォームまで移動
    $('html, body').animate({
      scrollTop: $('#anchor_inquiryForm').offset().top
    }, {
      queue: false
    });
    $('.document input').prop('checked', false); // 全てのチェックを外す
    $('article.resp form li.clr.document div.col.span_9 label').css('display', 'none'); // 全ての項目を非表示
    // ボタンごとにチェックを入れる
    var trg = $('input[value="' + name + '"]');
    trg.prop('checked', true); // チェックを付ける
    trg.parent().stop(true, true).fadeIn(1000); // 項目を表示する
  });
});

function table(data) {
  var title = data.title;
  var url = data.url;
  var size = (function(){
    if (data.size == '') return '15px';
    return data.size;
  })();
  // nameが空のときribbonはsoon
  var ribbon = (function(){
    if (data.name == '') return 'soon';
    return data.ribbon;
  })();
  // ribbonがsoonのときnameは空
  var name = (function(){
    if (ribbon == 'soon') return '';
    return data.name;
  })();
  // buttonのそれぞれ
  var button = (function(){
    if (ribbon == 'soon') return '準備中';
    return 'Download';
  })();
  // HTML生成
  var html =
    '<div class="flex-item"><div>' +
    '<h2 style="font-size:' + size + ';">' + title + '</h2>' +
    '<div class="ribbon ' + ribbon + '"><iframe src="' + url + '" frameborder="0" height="254"></iframe></div>' +
    // allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"
    '<div class="button" data-name="' + name + '">' + button + '</div>' +
    '</div></div>';
  if (title != '' && url != '') $('#docs').append(html);
}

function checkbox(data) {
  var name = data.name;
  var title = data.title;
  if (name === '') return;
  if ($('#docs').length) {
    // 入力画面
    var trg = $('.document input[value="' + name + '"]').parent();
    var htmlData = trg.html();
    if (htmlData == null) return;
    var htmlCode = htmlData.match(/(<.+>)/)[1] + title;
    trg.html(htmlCode);
  } else {
    // 確認画面
    var trg = $('.document .input');
    var htmlData = trg.html();
    if (htmlData == null) return;
    var htmlCode = htmlData.replace(new RegExp(name), title);
    trg.html(htmlCode);
  }
}