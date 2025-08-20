$(function() {
  // タイトルの改行
  var txt = $('.hero-text > span').text();
  var rep = txt.replace(/】/, '】<br>');
  $('.hero-text > span').html(rep);
  // ラジオボタンの処理（Bug Fixed）
  var obj = {};
  $(document).on('click', 'input:radio', function() {
    var value = $(this).val();
    var name = $(this).attr('name');
    if (value == obj[name]) {
      $(this).prop('checked', false);
      obj[name] = 0;
    } else {
      $(this).prop('checked', true);
      obj[name] = value;
    }
  });
  // ページ移動
  var position = $('#anchor_inquiryForm').offset().top;
  $(document).on('click', 'a[href="#anchor_inquiryForm"]', function() {
    var option = {
      scrollTop: position
    };
    $('html, body').animate(option, 500);
    return false;
  });
});