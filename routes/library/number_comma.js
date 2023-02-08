module.exports = {
  number_comma: function(str_or_number) {
    return str_or_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

