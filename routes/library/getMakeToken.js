var getRandomNumber = require('./getRandomNumber').getRandomNumber;
var getRandomString = require('./getRandomString').getRandomString;

module.exports = {
  getMakeToken: function(strlength) {
    var timestamp = new Date().getTime();
    var timestamp_length = timestamp.toString().length;
    var str_max_length = strlength - timestamp_length;
    var first_length = getRandomNumber(1, str_max_length);
    var second_length = str_max_length - first_length;
    const token = ''.concat(
      getRandomString(first_length),
      new Date().getTime(),
      getRandomString(second_length)
    );
    return token;
  }
};