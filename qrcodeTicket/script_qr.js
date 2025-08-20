// QRコード
$(function(){
  var url = $('.clr:nth-child(1) input').val();
  var sskc = $('.clr:nth-child(2) p').text();
  var name = $('.clr:nth-child(3) input').val().replace(/,/g,'');
  var company = $('.clr:nth-child(4) input').val().replace(/,/g,'');
  var query = name+','+company;
  var queryEncd = window.btoa(unescape(encodeURIComponent(query)));
  var queryEncdUrl = encodeURIComponent(queryEncd);
  var qrUrl = url+'&sskc='+sskc+'&query='+queryEncdUrl;
  console.log('query: '+query);
  console.log('qrUrl: '+qrUrl);
  $('#qrcode').qrcode({text:qrUrl});
});