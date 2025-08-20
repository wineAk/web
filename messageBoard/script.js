$(function() {
  // markdown-it
  var markdownit = window.markdownit({
    html: true,
    breaks: true,
    //linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return '';
    }
  });
  // highlight.js
  hljs.initHighlightingOnLoad();
  // markdown-it
  var md = markdownit.render(getHtml('#markdown'));
  var rep = md.replace(/<h1>/g, '<h1 onselectstart="return false" unselectable="on">');
  $('#markdown').html(rep);
  // click
  $('h1').on('click',function() {
    $(this).next().slideToggle('slow');
  });
});
function getHtml(selector) {
  var time = new Date();
  var year = toDoubleDigits(time.getFullYear());
  var month = toDoubleDigits(time.getMonth() + 1);
  var date = toDoubleDigits(time.getDate());
  var ymd = year+'年'+month+'月'+date+'日';
  var html = $(selector).html();
  var rep = html
    .replace(/(\r\n|\n|\r)(\* .+)/g, '\n</div>\n\n$2\n\n<div class="box-message">\n')
    .replace(/\*/g, '#') // 見出し
    .replace(/''/g, '**') // 太字
    .replace(/%%/g, '~~') // 打ち消し線
    .replace(/\+/g, '1.') // 箇条書き（数字）
    .replace(/＞/g, '>')
    //.replace(/┏━+┓/g, '\n<div class="box-message">\n')
    //.replace(/┗━+┛/g, '\n</div>\n')
    .replace(/┏━+/g, '\n<div class="box-table"><div class="table-cell">\n')
    .replace(/━+┛/g, '\n</div></div>\n')
    .replace(/━+/g, '\n</div><div class="table-cell">\n')
    .replace(/(https?:\/\/[\x21-\x7e]+)/g, '<a href="$1" target="_blank">$1</a>')
    .replace(/#年月日#/g, ymd);
  return rep;
}
function toDoubleDigits(num) {
  var str = String(num);
  var txt = (function() {
    if(str.length == 1) return '0'+str;
    return str;
  })();
  return txt;
}