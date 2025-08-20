$(function() {
  var ua = window.navigator.userAgent;
  var yourBrowser = (function() {
    if (/Edge/.test(ua)) return ['edge/edge_16x16.png', 'Edge', 'Microsoft Edge'];
    if (/Trident/.test(ua)) return ['archive/internet-explorer_9-11/internet-explorer_9-11_16x16.png', 'IE', 'Internet Explorer'];
    if (/Chrome/.test(ua)) return ['chrome/chrome_16x16.png', 'Chrome', 'Google Chrome'];
    if (/Firefox/.test(ua)) return ['firefox/firefox_16x16.png', 'Firefox', 'Mozilla Firefox'];
    if (/Safari/.test(ua)) return ['safari/safari_16x16.png', 'Safari', 'Safari'];
    return false;
  })();
  if (yourBrowser) {
    var img = yourBrowser[0];
    var name_s = yourBrowser[1];
    var name = yourBrowser[2];
    var text = '<img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/51.0.17/' + img + '" alt="ロゴ（' + name_s + '）"> ' + name;
    var textRep = $('#your-browser').text().replace(/\$browser\$/, text);
    $('#your-browser').html(textRep);
  } else {
    $('#your-browser').css('display', 'none');
  }
  lightbox.option({
    'albumLabel': '%1 / %2 ページ',
    'resizeDuration': 200,
    'wrapAround': true
  });
  $('#manual .browser h2').on('click', function() {
    $(this).next().slideToggle('slow');
  });
  $('#calling button').on('click', function() {
    var w = window.screen.width - 300;
    var h = window.screen.height - 260;
    var l = (screen.width - w) / 2;
    var t = (screen.height - h) / 2;
    window.open(
      'https://calling.fun/saleslight?utm_source=www.calling.fun&utm_campaign=all-saleslight',
      'callingwindow',
      'width=' + w + ',height=' + h + ',left=' + l + ',top=' + t + ',scrollbars=yes'
    );
  });
});