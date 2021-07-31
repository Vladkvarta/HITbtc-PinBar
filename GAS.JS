var API_TOKEN = "TOKEN";
var TELEGRAM_URL = "https://api.telegram.org/bot" + API_TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbyFcXdOyJmNyOxaRgSXsjyawCjTEIkxsHXQOyFJa39Aqnow0ruvoEyBsIh2jEJenJTG/exec";
//TELEGRAM_URL + "/setWebhook?url=" + webAppUrl
function pinBar() {
  var TICKER = JSON.parse(UrlFetchApp.fetch("https://api.hitbtc.com/api/2/public/ticker"));
  Utilities.sleep(10);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Времянка");
  var put = ss.getSheets()[1];
  var lastRow = put.getLastRow();
  var lastCol = put.getLastColumn();

  var usdPrice = sheet.getRange("D3").getValue();
  var btcPrice = sheet.getRange("D4").getValue();
  var ethPrice = sheet.getRange("D5").getValue();
  var coef = sheet.getRange("D6").getValue() * 1;

  var memory = put.getRange(3, 1, lastRow, lastCol).getValues();
  var arr = [];
  var filterKeys = new Array;

  for (var l = 0; l <= 3; l++) {
    var c = 0;
    var sendT;
    var periodSend;
    var body;
    var shadow;
    var min;
    var max;
    var value;
    var open;
    var close;
    var counter = 0;
    var volumeQuote = 0;
    var timeStamp;
    var tempPrice;
    var c;
    var qntt = 0;

    switch (l) {
      case 0:
        periodSend = "D1";
        break;
      case 1:
        periodSend = "1M";
        break;
      case 2:
        periodSend = "D7";
        break;
    }

    var DATA = JSON.parse(UrlFetchApp.fetch("https://api.hitbtc.com/api/2/public/candles/?limit=2&sort=DESC&period=" + periodSend));

    for (key in DATA) { c++ }
    for (key in DATA) {
      if (DATA.hasOwnProperty(key)) {
        for (var q = 0; q <= c; q++) {
          if (typeof (TICKER[q]) !== 'undefined' && typeof (DATA[key][1]) !== 'undefined') {
            if (key == TICKER[q].symbol) {
              volumeQuote = Math.round(TICKER[q].volumeQuote * 100) / 100;
              timeStamp = DATA[key][1].timestamp.substring(16, 0);
              open = Math.round(DATA[key][1].open * 10000000000) / 100000;
              close = Math.round(DATA[key][1].close * 10000000000) / 100000;
              min = Math.round(DATA[key][1].min * 10000000000) / 100000;
              max = Math.round(DATA[key][1].max * 10000000000) / 100000;

              if (key.substring(key.length - 3) === 'USD') {
                tempPrice = usdPrice;
              }
              if (key.substring(key.length - 3) === 'BTC') {
                tempPrice = btcPrice;
              }
              if (key.substring(key.length - 3) === 'ETH') {
                tempPrice = ethPrice;
              }

              if (volumeQuote >= tempPrice) { // настраиваемый параметр
                //                     [0] /  H4[1]     /     [2]          Валюта [3]             / Время [4] /[5] /[6] / [7] / [8]
                filterKeys[counter] = [key, periodSend, volumeQuote, key.substring(key.length - 3), timeStamp, min, max, open, close];
                counter++;
                volumeQuote = 0;
              }
            }
          }
        }
      }
    }

    for (e = 0; e < filterKeys.length; e++) {
      let opeN = filterKeys[e][7];
      let closE = filterKeys[e][8];
      let maX = filterKeys[e][6];
      let miN = filterKeys[e][5];
      let tekToken = filterKeys[e][0];
      let tekTime = filterKeys[e][4];
      let quote = filterKeys[e][2];
      let valuta = filterKeys[e][3];

      if (opeN > closE) {                                            //red bar

        body = Math.round((opeN - closE) * 1000000000) / 100000;
        shadow = Math.round(((maX - opeN) + (closE - miN)) * 1000000000) / 100000;
        value = (1 * body) / (shadow * 1);

        if (typeof (value) == 'Infinity') { value = 0 }

        if (value + 0.005 < coef && faceControl(memory, tekToken, periodSend, tekTime) == true) {
          arr.push(["PinBar", tekToken, periodSend, value, quote, valuta, tekTime]);
          if (typeof (sendT) !== 'undefined') {
            sendT = sendT + "<strong>" + "PinBar Hitbtc " + tekToken + " " + periodSend + '</strong> \n' + "Тело= " + Math.round(value * 1000) / 10 + "% " + '\n' + "Обьем " + quote + " " + valuta + ' в сутки \n' + tekTime + '\n' + '\n';
            qntt++;

            if (qntt >= 5) { sendText(sendT); qntt = 0; sendT = undefined; Utilities.sleep(10) }
          }
          else sendT = "<strong>" + "PinBar Hitbtc " + tekToken + " " + periodSend + '</strong> \n' + "Тело= " + Math.round(value * 1000) / 10 + "% " + '\n' + "Обьем " + quote + " " + valuta + ' в сутки \n' + tekTime + '\n' + '\n';
          qntt++;
        }
      }

      else {                                                           //green bar
        body = Math.round((closE - opeN) * 1000000000) / 100000;
        shadow = Math.round(((maX - closE) + (opeN - miN)) * 1000000000) / 100000;
        value = (1 * body) / (shadow * 1);
        if (typeof (value) == 'Infinity') { value = 0 }

        if (value + 0.005 < coef && faceControl(memory, tekToken, periodSend, tekTime) == true) {

          arr.push(["PinBar", tekToken, periodSend, value, quote, valuta, tekTime]);
          if (typeof (sendT) !== 'undefined') {
            sendT = sendT + "<strong>" + "PinBar Hitbtc " + tekToken + " " + periodSend + '</strong> \n' + "Тело= " + Math.round(value * 1000) / 10 + "% " + '\n' + "Обьем " + quote + " " + valuta + ' в сутки \n' + tekTime + '\n' + '\n';
            qntt++;
            if (qntt >= 5) { sendText(sendT); qntt = 0; sendT = undefined; Utilities.sleep(10) }
          }
          else {
            sendT = "<strong>" + "PinBar Hitbtc " + tekToken + " " + periodSend + '</strong> \n' + "Тело= " + Math.round(value * 1000) / 10 + "% " + '\n' + "Обьем " + quote + " " + valuta + ' в сутки \n' + tekTime + '\n' + '\n';
            qntt++;
          }
        }
      }
    }
  }

  if (typeof (sendT) !== 'undefined') { sendText(sendT); Utilities.sleep(10) }
  if (typeof (sendT) !== 'undefined') { Logger.log(sendT); Utilities.sleep(10) }

  if (arr.length > 0) { put.getRange(lastRow + 1, 1, arr.length, arr[0].length).setValues(arr) }

}
function sendText(text) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
        chat_id: "chat_id", //PAST chat_id
      text: text,
      parse_mode: "HTML",
    }
  };
  UrlFetchApp.fetch(TELEGRAM_URL + '/', data);
}

function faceControl(memory, m, s, v) {
  var a = true;
  var ccc = 0;
  for (var i = 0; i < memory.length; i++) {
    if (memory[i][1] == m && memory[i][2] == s && memory[i][6] == v) { ccc++; a = false }
  }
  return a;
}

