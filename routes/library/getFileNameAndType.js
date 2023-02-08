module.exports = {
  getFileNameAndType: function(full_file_name) {
    var file_full_name_split = full_file_name.split('.');
    var file_only_name = '';
    var file_only_type = '';
    if (file_full_name_split.length == 1) {
        file_only_name = file_full_name_split[0];
        file_only_type = '';
    } else if (file_full_name_split.length == 2) {
        file_only_name = file_full_name_split[0];
        file_only_type = file_full_name_split[1];
    } else if (file_full_name_split.length > 2) {
        for (var kk=0; kk<file_full_name_split.length - 1; kk++) {
            file_only_name += file_full_name_split[kk];
            if (kk != file_full_name_split.length - 2) {
                file_only_name += '.';
            }
        }
        file_only_type = file_full_name_split[file_full_name_split.length - 1];
    }
    return {
      file_only_name: file_only_name,
      file_only_type: file_only_type
    };
  }
};

