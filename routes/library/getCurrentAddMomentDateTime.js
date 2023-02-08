var moment = require('moment-timezone');

module.exports = {
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