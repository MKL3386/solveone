var moment = require('moment-timezone');

module.exports = {
  getCurrentMomentDatetime: function() {
    var dateObject = moment(new Date()).tz('Asia/Seoul').format();
    var date = dateObject.slice(0, 10);
    var time = dateObject.slice(11, 19);
    var datetime = date + ' ' + time;
    
    return datetime;
  }
};