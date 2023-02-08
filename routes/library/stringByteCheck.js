module.exports = {
  stringByteCheck: function(s,b,i,c) {
    for(b=i=0;c=s.charCodeAt(i++);b+=(c==10)?2:((c>>7)?2:1)); return b;
  }
};

