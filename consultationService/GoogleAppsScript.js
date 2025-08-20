var saved = '';
var apiKey = '';
var token = '';

var listObj = {};

function getSaaskeData() {
  var data = {
    'saved_number': saved
  };
  var options = {
    'method': 'POST',
    'contentType': 'application/json',
    'headers': {
      'x-api-key': apiKey,
      'x-token': token
    },
    'payload': JSON.stringify(data)
  };
  var url = 'https://api.saaske.com/v1/lead/list';
  var response = UrlFetchApp.fetch(url, options);
  var content = response.getContentText('UTF-8');
  var contentObj = JSON.parse(content);
  var list = contentObj.list;
  // レコードごとに処理
  for (var i = 0, n = list.length; i < n; i++) {
    var historyGroup = list[i].history_group;
    var dateLog = '';
    // 履歴グループの項目ごとに処理
    for (var j = 0, m = historyGroup.length; j < m; j++) {
      var name = historyGroup[j].name;
      var value = historyGroup[j].value;
      var setting = {
        'time-13': false,
        'time-15': false
      };
      if (/確定　日付/.test(name)) {
        dateLog = value.replace(/-/g, '/');
        if (listObj[dateLog] == null) listObj[dateLog] = setting;
      } else if (/確定　時間/.test(name)) {
        if (/13時～/.test(value)) listObj[dateLog]['time-13'] = true;
        if (/15時～/.test(value)) listObj[dateLog]['time-15'] = true;
      }
    }
  }
  Logger.log(JSON.stringify(contentObj, null, 2));
}

function doGet() {
  try {
    getSaaskeData();
  } catch (e) {
    Logger.log(e);
  }
  var obj = {};
  obj.date = Utilities.formatDate(new Date(), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm:ss'+09:00'");
  obj.reserve = listObj;
  var json = JSON.stringify(obj, null, 2);
  Logger.log(json);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}