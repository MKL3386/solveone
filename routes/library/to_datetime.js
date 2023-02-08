var moment = require('moment-timezone');

module.exports = {
  to_datetime: function(js_datetime) {
    if (js_datetime == null || js_datetime == "" || js_datetime == undefined) {
      return {
        year: null,
        month: null,
        date: null,
        hour: null,
        minute: null,
        second: null,
        dayIndex: null,
        dayKoFull: null,
        dayKoSmall: null,
        dayEnFull: null,
        dayEnSmall: null,
        datetime: null
      };
    } else {
      var dateObject = null;
      if (typeof js_datetime == 'Date') {
        dateObject = js_datetime;  
      } else {
        dateObject = new Date(js_datetime);  
      }
      
    
      var dayKoFulls = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      var dayKoSmalls = ['일', '월', '화', '수', '목', '금', '토'];
      var dayEnFulls = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var dayEnSmalls = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
      var year = dateObject.getFullYear();
      
      var month = dateObject.getMonth() + 1;
      var monthStr = month;
      if (month < 10) {
        monthStr = '0' + month;
      }
      
      var date = dateObject.getDate();
      var dateStr = date;
      if (date < 10) {
        dateStr = '0' + date;
      }
      
      var hour = dateObject.getHours();
      var hourStr = hour;
      if (hour < 10) {
        hourStr = '0' + hour;
      }
      
      var minute = dateObject.getMinutes();
      var minuteStr = minute;
      if (minute < 10) {
        minuteStr = '0' + minute;
      }
      
      var second = dateObject.getSeconds();
      var secondStr = second;
      if (second < 10) {
        secondStr = '0' + second;
      }
      
      var lastDate = (new Date(year, month, 0)).getDate();
      
      var dayIndex = dateObject.getDay();
      var dayKoFull = dayKoFulls[dayIndex];
      var dayKoSmall = dayKoSmalls[dayIndex];
      var dayEnFull = dayEnFulls[dayIndex];
      var dayEnSmall = dayEnSmalls[dayIndex];
      
      var datetime = year + '-' + monthStr + '-' + dateStr + ' ' + hourStr + ':' + minuteStr + ':' + secondStr;
      var first_datetime = year + '-' + monthStr + '-' + '01' + ' ' + '00' + ':' + '00' + ':' + '00';
      var last_datetime = year + '-' + monthStr + '-' + lastDate + ' ' + '23' + ':' + '59' + ':' + '59';
      var first_datetime_not_second = year + '-' + monthStr + '-' + '01' + ' ' + '00' + ':' + '00';
      var last_datetime_not_second = year + '-' + monthStr + '-' + lastDate + ' ' + '23' + ':' + '59';
      
      var onlyDate = year + '-' + monthStr + '-' + dateStr;
      var ymdhis = (year + '').concat(monthStr, dateStr, hourStr, minuteStr, secondStr);
      
      return {
        year: year,
        month: month,
        monthStr: monthStr,
        date: date,
        dateStr: dateStr,
        hour: hour,
        hourStr: hourStr,
        minute: minute,
        minuteStr: minuteStr,
        second: second,
        secondStr: secondStr,
        lastDate: lastDate,
        dayIndex: dayIndex,
        dayKoFull: dayKoFull,
        dayKoSmall: dayKoSmall,
        dayEnFull: dayEnFull,
        dayEnSmall: dayEnSmall,
        datetime: datetime,
        
        first_datetime: first_datetime,
        first_datetime_not_second: first_datetime_not_second,
        last_datetime: last_datetime,
        last_datetime_not_second: last_datetime_not_second,
        
        YmdHis: ymdhis,
        onlyDate: onlyDate
      };
    }
  },
  getCurrentMomentDatetime: function() {
    var dateObject = moment(new Date()).tz('Asia/Seoul').format();
    var date = dateObject.slice(0, 10);
    var time = dateObject.slice(11, 19);
    var datetime = date + ' ' + time;
    
    return datetime;
  },
  getCurrentAddMomentDateTime: function(type, value) {
    var dateObject = moment(new Date()).tz('Asia/Seoul').format();
    var date = dateObject.slice(0, 10);
    var time = dateObject.slice(11, 19);
    var datetime = date + ' ' + time;
    var datetimeObj = new Date(datetime);
    
    var addDateTimeObj = datetimeObj;
    
    switch (type) {
      case 'year':
        addDateTimeObj = addDateTimeObj.setYear(addDateTimeObj.getFullYear() + value);
        break;
      case 'month':
        addDateTimeObj = addDateTimeObj.setMonth(addDateTimeObj.getMonth() + value);
        break;
      case 'date':
        addDateTimeObj = addDateTimeObj.setDate(addDateTimeObj.getDate() + value);
        break;
      case 'hour':
        addDateTimeObj = addDateTimeObj.setHours(addDateTimeObj.getHours() + value);
        break;
      case 'minute':
        addDateTimeObj = addDateTimeObj.setMinutes(addDateTimeObj.getMinutes() + value);
        break;
      case 'second':
        addDateTimeObj = addDateTimeObj.setSeconds(addDateTimeObj.getSeconds() + value);
        break;
    }
    
    addDateTimeObj = new Date(addDateTimeObj);
    
    var add_year = addDateTimeObj.getFullYear();
    var add_month = addDateTimeObj.getMonth() + 1;
    if (add_month < 0) {
      add_month = '0' + add_month;
    }
    var add_date = addDateTimeObj.getDate();
    if (add_date < 0) {
      add_date = '0' + add_date;
    }
    var add_hour = addDateTimeObj.getHours();
    if (add_hour < 0) {
      add_hour = '0' + add_hour;
    }
    var add_minute = addDateTimeObj.getMinutes();
    if (add_minute < 0) {
      add_minute = '0' + add_minute;
    }
    var add_second = addDateTimeObj.getSeconds();
    if (add_second < 0) {
      add_second = '0' + add_second;
    }
    
    var add_datetime = ''.concat(
      add_year, '-', add_month, '-', add_date, ' ',
      add_hour, ':', add_minute, ':', add_second
    );
    
    return add_datetime;
  }
};
