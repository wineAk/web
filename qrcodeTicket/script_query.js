// https://qiita.com/kuro123/items/b009e65cfac5eb1bb502
$(function(){
  $('#deleteQuery').on('click',function(){
    var urlQueryString = document.location.search;
    var replaceQueryString = "";
    if (urlQueryString !== "") {
        // クエリストリング毎に分割
        var params = urlQueryString.slice(1).split("&");
        // クエリストリング確認用
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split("=");
            var key = param[0];
            var value = param[1];
            // 該当するクエリストリングは無視
            if (!/^(c|sskc)$/.test(key)) continue;
            // 新たにクエリストリングを作成
            if (replaceQueryString !== "") {
                replaceQueryString += "&";
            } else {
                replaceQueryString += "?";
            }
            replaceQueryString += key + "=" + value;
        }
    }
    // URLに新しいクエリストリングを付与
    history.pushState(null,null,replaceQueryString);
  });
});