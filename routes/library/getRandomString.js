module.exports = {
  getRandomString: function(str_length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i=0; i<str_length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  getRandomNumberOneString: function(is_zero_include) {
    var text = "";
    var possible = "123456789";
    if (is_zero_include) {
      possible = "0123456789";
    }
    
    for (var i=0; i<1; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
};

