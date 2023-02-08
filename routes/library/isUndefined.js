module.exports = {
  isUndefined: function(variables) {
    if (variables == undefined || typeof variables == "undefined" || variables == "" || variables == null || typeof variables == "null") {
      return true;      
    } else {
      return false;
    }
  }
};