window.onload = function(){
  // ie
  var userAgent = window.navigator.userAgent.toLowerCase();
  if(userAgent.match(/(msie|trident)/i)){
    //document.getElementById('ie_alert').classList.remove('display_none'); // IE9未対応
    document.getElementById('ie_alert').className = 'alert_text'; // IE9対応
  }
};
$(function(){
  // test
  //$('.wgt_others').after('<button id="ie_open">IE表示</button>');
  $(document).on('click', '#ie_open', function(){
    $('#ie_alert').removeClass('display_none');
  });
  // luminous
  var luminousTrigger = document.querySelectorAll('.zoom-in');
  new LuminousGallery(luminousTrigger, {}, {
    caption: function(trigger){
      return trigger.querySelector('img').getAttribute('alt');
    }
  });
  // form
  var number;
  $('input').click(function(){
    if($(this).val() == number){
      $(this).prop('checked', false);
      number = 0;
    } else {
      number = $(this).val();
    }
  });
  // url
  var text = $('label.col.span_3').text();
  var urlText = (function(){
    if(text.match(/https?:\/\//)) return text;
    return 'http://' + text;
  })();
  $('#online_url').attr('href', urlText);
  if(!text.length){
    $('#online_btn').unwrap().after('<p>現在公開しておりません</p>');
  }
  // browser title
  $(document).on('click', '#seminar_form h2', function(){
    $(this).next().slideToggle('slow');
  });
});