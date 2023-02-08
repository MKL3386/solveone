var express = require('express');
var router = express.Router();


var getMakeToken = require('./library/getMakeToken').getMakeToken;


/* GET home page. */
router.get('/', function(req, res, next) {
  // res.json({result:"fail", code:100100, t:getMakeToken(100)});
  res.status(403).end();
  return;
});

module.exports = router;
