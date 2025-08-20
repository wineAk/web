// 参加フォーム
$(function(){
  var sskc = $('.clr:nth-child(1) p').text();
  $('.clr:nth-child(2) option').each(function(i){
    var sskcList = this.value;
    console.log('['+i+'] sskcList:'+sskcList+' / sskc:'+sskc);
    if(sskcList == sskc){
      $('.wgt-form__heading').text('参加者です');
      $('.clr:nth-child(2) select').val(sskc);
      queryDecode();
      return false;
    }else{
      $('.wgt-form__heading').text('参加者ではありません');
    }
  });
});
function queryDecode(){
  var query = $('.clr:nth-child(3) input').val();
  var queryAry = decodeURIComponent(escape(window.atob(query))).split(',');
  console.log(queryAry);
  $('.clr:nth-child(4) input').val(queryAry[0]);
  $('.clr:nth-child(5) input').val(queryAry[1]);
}