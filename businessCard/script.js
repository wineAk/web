$(function() {
  var cardHTML = '' +
    '<div class="header-container">' +
    '<div class="header-inner">' +
    '<img src="' + ICON_URL + '" class="header-face">' +
    '<div class="header-profile">' +
    '<p class="header-company">' + COMPANY + '</p>' +
    '<p class="header-department">' + DEPARTMENT + '</p>' +
    '<p class="header-position">' + POSITION + '</p>' +
    '<p class="header-name">' + NAME + '</p>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="card-container">' +
    '<div class="card-inner">' +
    '<div class="card-image">' +
    '<img src="' + CARD_URL + '">' +
    '<a class="card-title card-dl">名刺画像を保存</a>' +
    '</div>' +
    '<div class="card-table">' +
    '<table>' +
    '<tr> <th>会社名</th> <td>' + COMPANY + '</td> </tr>' +
    '<tr> <th>部署</th> <td>' + DEPARTMENT + '</td> </tr>' +
    '<tr> <th>役職</th> <td>' + POSITION + '</td> </tr>' +
    '<tr> <th>名前</th> <td>' + NAME + '</td> </tr>' +
    '<tr> <th>E-mail</th> <td>' + EMAIL + '</td> </tr>' +
    '</table>' +
    '<table id="tableToggle">' +
    '<tr> <th>電話番号</th> <td>' + TEL + '</td> </tr>' +
    '<tr> <th>FAX</th> <td>' + FAX + '</td> </tr>' +
    '<tr> <th>郵便番号</th> <td>' + ZIP + '</td> </tr>' +
    '<tr> <th>住所</th> <td>' + ADDRESS + '</td> </tr>' +
    '<tr> <th>ビル名</th> <td>' + BUILDING + '</td> </tr>' +
    '<tr> <th>ホームページ</th> <td>' + URL + '</td> </tr>' +
    '</table>' +
    '<div class="card-open"> <div class="card-title"> <span>↓</span> 詳細を開く <span>↓</span> </div> </div>' +
    '<div class="card-close"> <div class="card-title"> <span>↑</span> 詳細を閉じる <span>↑</span> </div> </div>' +
    '</div>' +
    '</div>' +
    '</div>';
  document.getElementById('card-root').innerHTML = cardHTML;
  var formModal = function() {
    var href = window.location.href;
    var wf = href.match(/(wf[0-9]+)/)[0];
    var url = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=https%3A%2F%2Fsecure-link.jp%2Fwf%2F%3Fc%3D' + wf;
    $('.modal-image').attr('src', url);
    $('.modal').css('display', 'block');
    $('.modal').insertAfter('body');
  };
  formModal();
  $('.submit_btn.row input').val('送信する');
  $('[type="file"]').each(function(i) {
    var id = $(this).attr('id');
    var txt = (i === 0) ? '表面' : '裏面';
    $(this).attr('accept', 'image/*'); // */
    $(this).wrap('<label for="' + id + '" class="file-container">');
    $(this).before('<p>選択されていません</p>');
    $(this).before('<div class="file-ui">名刺の「' + txt + '」を撮る</div>');
    $(this).parent().before('<img id="img' + id + '" src="">');
  });
  $('.form_list li').each(function() {
    var text = $(this).text();
    (/名刺/.test(text)) ? $(this).addClass('input-card'): $(this).addClass('input-text');
    if (/裏|部署|役職/.test(text)) $(this).addClass('not-required');
  });
  $('.input-card').wrapAll('<div id="input-card-container">');
  $('.input-text').wrapAll('<div id="input-text-container">');
  //$('.card-dl').attr('href', $('.card-image img').attr('src'));

  var required = function(trg) {
    $('#input-card-container input, #input-text-container input').each(function() {
      $(this).removeAttr('required');
    });
    $('#input-' + trg + '-container input').each(function() {
      if ($(this).parents('li.clr').hasClass('not-required')) return;
      $(this).parents('li.clr').find('.span_3').addClass('required');
      $(this).attr('required', true);
    });
  };
  var inputOpen = function(val) {
    if (val === 'card') {
      $('#input-card-container').stop(true, true).fadeToggle(1000);
      $('#input-text-container').stop(true, true).toggle();
    } else {
      $('#input-card-container').stop(true, true).toggle();
      $('#input-text-container').stop(true, true).fadeToggle(1000);
    }
  };
  var nowVal = $('[name="your-card"]').val();
  required(nowVal);
  //inputOpen(nowVal);

  $('[name="your-card"]').on('change', function() {
    var val = $(this).val();
    required(val);
    inputOpen(val);
  });
  $('[type="file"]').on('change', function(e) {
    if (!this.files.length) return;
    var id = $(this).attr('id');
    var fileName = $(this).prop('files')[0];
    $(this).prevAll('p').text(fileName.name);
    var reader = new FileReader();
    reader.onload = function(e) {
      $('#img' + id).attr('src', reader.result);
    }
    reader.readAsDataURL(fileName);
  });
  $('.card-open .card-title').on('click', function() {
    $('#tableToggle').stop(true, true).fadeToggle(1000);
    $('.card-open').css('display', 'none');
    $('.card-close').css('display', 'block');
  });
  $('.card-close .card-title').on('click', function() {
    $('#tableToggle').stop(true, true).fadeToggle(500);
    $('.card-close').css('display', 'none');
    $('.card-open').css('display', 'block');
  });
  $('.card-dl').on('click', function(e) {
    var image = new Image();
    image.src = CARD_URL;
    image.crossOrigin = 'anonymous';
    image.onload = function() {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      var base64 = canvas.toDataURL('image/jpge');
      var fileName = '名刺画像.jpg';
      var alink = document.createElement('a');
      alink.href = base64;
      alink.download = fileName;
      alink.click();
    }
    image.onerror = function(e) {
      console.log('保存エラー', e);
    }
    return false;
  });
  $('.modal-close').on('click', function() {
    $('.modal').stop(true, true).fadeToggle(1000);
  });
});