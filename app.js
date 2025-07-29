var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var helmet = require('helmet');
var geoip = require('geoip-lite');


var requestIP = require('request-ip');
var moment = require('moment-timezone');


var getCurrentMomentDatetime = require('./routes/library/getCurrentMomentDatetime').getCurrentMomentDatetime;

require('dotenv').config();


var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var RedisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
var redisConnectionResult = RedisClient.auth(process.env.REDIS_PASSWORD, function(err) {
  if (err) {
    console.log('Redis 에러 발생');
    console.log(err, " 에러 발생했습니다.");
  } else {
    
  }
});



var mysql = require('sync-mysql');
var connection = new mysql({
  host: process.env.DATABASE_IP_ADDR, // mysql주소
  port: process.env.DATABASE_PORT, 
  user: process.env.DATABASE_ID,  // 유저 
  password: process.env.DATABASE_PASSWORD, // 비밀번호
  database: process.env.DATABASE // 데이터베이스 이름
});




var indexRouter = require('./routes/index');
// var hyoseongRouter = require('./routes/hyoseong'); // 효성 API 라우터

// 문자 라우터
var messageRouter = require('./routes/message');


// 문자 MMS 테스트 라우터
var message2Router = require('./routes/message2');


// 카카오 알림톡 라우터
var kakaoAtalkRouter = require('./routes/kakaoAtalk');
// var usersRouter = require('./routes/users');


// 외부 알림톡 라우터
var outerAlarmTalkRouter = require('./routes/outerAlarmTalk');



// 대량 문자 발송 시 안내문자 발송
var largeMunjaGuideRouter = require('./routes/largeMunjaGuide');





var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.THIS_PORT);

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({
    // client: RedisClient,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    pass: process.env.REDIS_PASSWORD,
    logErrors: true,
  }),
}));
app.use(flash());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard("deny"));
app.use(helmet.noSniff());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, '/static/files/')));
app.disable("x-powered-by");




// 접속 IP 출력
app.use(function(req, res, next) {
  let host = req.headers.host;
  
  var dateObject = moment(new Date()).tz('Asia/Seoul').format();
  var date = dateObject.slice(0, 10);
  var time = dateObject.slice(11, 19);
  var datetime = date + ' ' + time;
  
  
  if (host.indexOf('api.munjamoa.co.kr') !== -1) {
    // host에 munjamoa 문자열이 포함되어 있으면 문자모아로 셋팅
    
    
  } else {
    // host에 munjamoa가 포함되어 있지 않으면 접속 막기
    console.log('ipAddrDirectAccessTryDatetime ', datetime);
    console.log('ipAddrDirectAccessTryIp ', requestIP.getClientIp(req));
    console.log('ipAddrDirectAccessTryIpInfo', geoip.lookup(requestIP.getClientIp(req)));
    res.status(403).end();
    return;
  }
  
  
  
  
  console.log('============================================');
  console.log('============================================');
  console.log('request ip', requestIP.getClientIp(req));
  console.log('request ip info', geoip.lookup(requestIP.getClientIp(req)));
  console.log('request datetime', datetime);
  next();
});




// DB에 등록된 ip block list 체크하는 커스텀 미들웨어
app.use(function(req, res, next) {
  var dateObject = moment(new Date()).tz('Asia/Seoul').format();
  var date = dateObject.slice(0, 10);
  var time = dateObject.slice(11, 19);
  var datetime = date + ' ' + time;
  
  var current_ip = requestIP.getClientIp(req);
  req.middleware_current_ip = current_ip;
  
  // ip 주소 값이 공백일 경우
  if (current_ip == undefined || current_ip == null || current_ip == "") {
    res.send('ip 주소 변조가 의심되어 서비스 접근이 차단되었습니다. 고객센터에 문의해주세요.');
    return;
  }
  
  // 가장 최근 ip block 정보 가져오기
  let ip_block_check_result = connection.query(`
    SELECT 
    
    \`mibl\`.\`seq\` AS \`seq\`,
    \`mibl\`.\`logged_user_key\` AS \`logged_user_key\`,
    \`mibl\`.\`block_target_ip\` AS \`block_target_ip\`,
    \`mibl\`.\`created_at\` AS \`created_at\`,
    \`mibl\`.\`description\` AS \`description\`,
    \`mibl\`.\`web_message\` AS \`web_message\`,
    \`c\`.\`value1\` AS \`web_message_string\`, 
    \`mibl\`.\`auto_unblock_at\` AS \`auto_unblock_at\`,
    \`mibl\`.\`unblock_at\` AS \`unblock_at\`,
    \`mibl\`.\`unblocked_description\` AS \`unblocked_description\`,
    \`mibl\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`member_ip_block_log\` AS \`mibl\` 
    
    LEFT JOIN \`munjamoa\`.\`code\` AS \`c\` 
    ON (\`c\`.\`code_number\` = \`mibl\`.\`web_message\` AND \`c\`.\`code_group\` = 25) 
    
    WHERE \`mibl\`.\`block_target_ip\` = ? 
    
    ORDER BY \`mibl\`.\`created_at\` DESC 
    
    LIMIT 1
  `, [
    current_ip
  ]);
  
  
  // 결과가 없으면 block 내역 등록 안된 ip이므로 통과
  if (ip_block_check_result.length === 0) {
    next();
    return;
  }
  
  
  // 결과가 있으면 우선 유효한 block 내역인지 확인
  
  
  
  // status 유효성 확인
  var ip_block_log_status = ip_block_check_result[0].status;
  if (ip_block_log_status === 2) {
    // 유효하지 않는 내역이면 통과
    next();
    return;
  }
  
  
  var current_time = new Date(datetime).getTime();
  var auto_unblock_time = new Date(ip_block_check_result[0].auto_unblock_at).getTime();
  if (auto_unblock_time > current_time) {
    // 자동 접근 제한 풀리는 날짜가 현재 날짜보다 이후이면 진행 막기
    console.log('blocked ip', current_ip);
    res.send(ip_block_check_result[0].web_message_string);
    return;
  } 
  
  
  next();
  return;
});














app.use('/', indexRouter);

// 문자 API
app.use('/message', messageRouter);

// 문자 MMS API
app.use('/message2', message2Router);


// 카카오 알림톡 API
app.use('/kakaoAtalk', kakaoAtalkRouter);
// app.use('/users', usersRouter);

// 외부 알림톡 API
app.use('/outerAlarmTalk', outerAlarmTalkRouter);


// 외부 알림톡 API
app.use('/largeMunjaGuide', largeMunjaGuideRouter);







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  console.log('request url :', req.url);
  console.log('request ip :', requestIP.getClientIp(req));
  console.log('request datetime :', getCurrentMomentDatetime());
  console.log('message :', err.message);
  console.log('status :', err.status);
  console.log('stack');
  console.log(err.stack);



  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), function(){
  console.log(app.get('port'), '번 포트에서 대기중');
});

// module.exports = app;
