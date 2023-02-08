module.exports = {
  is_datetime_string: function(datetime_string) {
    if (datetime_string == undefined || datetime_string == null || datetime_string == "") {
      return false;
    }
    
    var space_split = datetime_string.split(' ');

    if (space_split.length !== 2) {
      return false;
    }
    
    
    var date_string = space_split[0];
    var time_string = space_split[1];
    
    var date_string_split = date_string.split('-');
  
    if (date_string_split.length !== 3) {
      return false;
    }
    
    if (date_string_split[0].length !== 4) {
      return false;
    }
    
    if (date_string_split[1].length !== 2) {
      return false;
    }
    if (date_string_split[2].length !== 2) {
      return false;
    }
    
    if (isNaN(Number(date_string_split[0]))) {
      return false;
    }
    if (isNaN(Number(date_string_split[1]))) {
      return false;
    }
    if (isNaN(Number(date_string_split[2]))) {
      return false;
    }
    
    
    
    var time_string_split = time_string.split(':');
    if (time_string_split.length !== 3) {
      return false;
    }
    
    if (time_string_split[0].length !== 2) {
      return false;
    }
    if (time_string_split[1].length !== 2) {
      return false;
    }
    if (time_string_split[2].length !== 2) {
      return false;
    }
    
    if (isNaN(Number(time_string_split[0]))) {
      return false;
    }
    if (isNaN(Number(time_string_split[1]))) {
      return false;
    }
    if (isNaN(Number(time_string_split[2]))) {
      return false;
    }
    
    return true;
  }
};
