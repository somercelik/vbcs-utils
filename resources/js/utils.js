define(['ojs/ojarraydataprovider', 'resources/js/xlsx.js'], function (ArrayDataProvider, XLSX) {
  'use strict';
  var exports = {};

  /**
   * Verilen diziyi .xlsx formatında dışa aktarır
   * @param { string } data        Excel çıktısı almak isteyeceğimiz objeler dizisi
   * @param { string } fileName    Dosya adı
   */
  function exportXLSX(data, fileName) {
    var ws = XLSX.utils.json_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WorksheetName");
    XLSX.writeFile(wb, fileName);
  };

  /**
    * Verilen CSV'yi JSON objesine dönüştürür.
    * @param { string } csvString        JSON objesine dönüştürmek istediğimiz CSV text'i
    * @param { string } delimiter        Her bir değeri ayırmak için kullandığımız ayırıcı karakter
    */
  function csvToJSON(csvString, delimiter) {
    //Enterlar'dan ayrılarak satırlar elde ediliyor
    var lines = csvString.split("\n");
    var result = [];
    //İlk satırdan header'lar ayrıştırılıyor.
    var headers = lines[0].split(delimiter);
    //Her bir satır için                                                    
    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      //Değerleri ayır
      var currentline = lines[i].split(delimiter);
      //İlk satırdaki header'lar için satırda dön
      for (var j = 0; j < headers.length; j++) {
        //O property'ye atamayı yap
        obj[headers[j]] = isNaN(currentline[j]) ? currentline[j] : Number(currentline[j]);
      }
      result.push(obj);
    }
    return result; //JavaScript object
  }


  /**
    * Verilen objeler dizisini CSV'ye dönüştürür ve indirir.
    * @param { string } filename         Dosya adı
    * @param { array }  rows             Çıktı almak istediğimiz objeler dizisi
    * @param { string } delimiter        Her bir değeri ayırmak için kullandığımız ayırıcı karakter
    */
  function exportToCsvFile(filename, rows, delimiter) {
    let csvFile = "";
    var universalBOM = "\uFEFF";
    var columns = Object.keys(rows[0]);
    var processRow = function (row) {
      var finalVal = '';
      for (var key in row) {
        var innerValue = row[key] === null ? '' : row[key].toString();
        if (row[key] instanceof Date) {
          innerValue = row[key].toLocaleString();
        };
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|;|\n)/g) >= 0)
          result = '"' + result + '"';

        finalVal += result;
        if (key != columns[columns.length - 1])
          finalVal += delimiter;
      }
      return finalVal + '\r\n';
    };

    for (let key in columns) {
      if (columns[key] != columns[columns.length - 1]) {
        csvFile += columns[key] + delimiter;
      } else {
        csvFile += columns[key] + '\r\n';
      }
    }

    for (var i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], {
      type: 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvFile)
    });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM + csvFile));
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  /**
  * Dialog kapatır/açar.
  * @param { string } dialogId         Açıp kapamak istediğimiz dialog'un id'si
  * @param { string } mode             İstediğimiz operasyon (open,close)
  */
  function openOrCloseDialog(dialogId, mode) {
    if (mode == 'open')
      document.getElementById(dialogId).open();
    else
      document.getElementById(dialogId).close();
  };

  /**
    * ArrayDataProvider oluşturur.
    * @param { array }  data             Objeler dizisi
    * @param { string } keyAttribute     Ayırt edici alan
  */
  function generateADP(data, keyAttribute) {
    let adp = new ArrayDataProvider(data, {
      keyAttributes: keyAttribute
    });
    return adp;
  };

  /**
    * Objeler dizisinden diziler dizisi oluşturur.
    * @param { array }  array            Objeler dizisi
    */
  function arrayizer(array) {
    let newArr = [];
    let columns = Object.keys(array[0]);
    newArr.push(columns);
    array.forEach(item => {
      let temp = [];
      columns.forEach(column => {
        temp.push(item[column]);
      });
      newArr.push(temp);
    });
    return newArr;
  };

  /**
    * Verilen sayıyı verilen para biriminde formatlayıp döndürür.
    * @param { number }  amount            Objeler dizisi
    */
  function formatCurrency(amount, currency) {
    var currencyFormatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    });
    return currencyFormatter.format(amount);
  };

  /**
    * Evrensel Benzersiz ID oluşturur.
    */
  function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  };

  /**
    * YYYYMMDDHHmmss tarih formatında string döndüren fonksiyon(Dosya isimlendirmede işe yarayabilir.)
  */
  function generateNowString() {
    let date = new Date();
    return date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
  }

  /**
    * Client makinedeki tarihi YYYY-MM-DD formatında döndürür
  */
  function getCurrentDate() {
    return new Date().toISOString.split("T")[0];
  };

  function pad2(n) {
    return n < 10 ? '0' + n : n;
  };

  exports.csvToJSON = csvToJSON;
  exports.exportToCsvFile = exportToCsvFile;
  exports.openOrCloseDialog = openOrCloseDialog;
  exports.generateADP = generateADP;
  exports.arrayizer = arrayizer;
  exports.formatCurrency = formatCurrency;
  exports.generateUUIDv4 = generateUUIDv4;
  exports.generateNowString = generateNowString;
  exports.getCurrentDate = getCurrentDate;
  exports.pad2 = pad2;
  exports.exportXLSX = exportXLSX;

  return exports;
});
