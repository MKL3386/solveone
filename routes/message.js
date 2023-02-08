var express = require('express');
var router = express.Router();
var fs = require('fs'); //
var request = require('request'); //
var axios = require('axios'); //
var path = require('path'); //

// my library
var check_regular_express = require('./library/regular_expression_library').check_regular_express;
var isUndefined = require('./library/isUndefined').isUndefined;
var stringByteCheck = require('./library/stringByteCheck').stringByteCheck;
var getMakeToken = require('./library/getMakeToken').getMakeToken;
var getCurrentMomentDatetime = require('./library/getCurrentMomentDatetime').getCurrentMomentDatetime;
var getCurrentAddMomentDateTime = require('./library/getCurrentAddMomentDateTime').getCurrentAddMomentDateTime;
var is_datetime_string = require('./library/is_datetime_string').is_datetime_string;
var to_datetime = require('./library/to_datetime').to_datetime;

var getRandomString = require('./library/getRandomString').getRandomString;
var wrapper = require('./library/myAsyncWrapper');


// npm
var requestIP = require('request-ip');
require('dotenv').config();
var moment = require('moment-timezone');
var mysql = require('sync-mysql');
var connection = new mysql({
  host: process.env.DATABASE_IP_ADDR, // mysql주소
  port: process.env.DATABASE_PORT, 
  user: process.env.DATABASE_ID,  // 유저 
  password: process.env.DATABASE_PASSWORD, // 비밀번호
  database: process.env.DATABASE, // 데이터베이스 이름
  multipleStatements: true,
});







var allow_ip_address_list = [
  '15.164.12.40', // 효성 ip 1
  '13.209.20.36', // 효성 ip 2
  '1.220.226.171', // 사무실 내자리 ip
  '106.247.164.157', // 사무실 내자리 태블릿 ip
];








// POST 요청에 x-www-form-urlencoded 방식으로 요청해야 한다.
router.post('/:company_initial/sendMsg', wrapper(async(req, res, next) => {
  // if (!allow_ip_address_list.includes(requestIP.getClientIp(req))) {
  //   // 효성 IP 주소가 아니면 막기
  //   res.json({result:"fail", code:500100});
  //   return;  
  // }
  
  
  console.log('req.headers =>>>>>> ', req.headers);
  console.log('req.body =>>>>>> ', req.body);
  
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn 또는 hyoseong
  
  if (typeof company_initial != "string") {
    res.json({result:"fail", code:100101});
    return;
  }
  
  
  // 해당 이니셜이 company_list에 있는지 체크
  const check_initial_exist = connection.query(`
    SELECT 
    
    \`cl\`.\`seq\` AS \`seq\`,
    
    \`cl\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`user_id\` AS \`user_id\`,
    \`m\`.\`user_name\` AS \`user_name\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    \`cl\`.\`company_name\` AS \`company_name\` 
    
    FROM \`munjamoa\`.\`company_list\` AS \`cl\` 
    
    LEFT JOIN \`munjamoa\`.\`member\` AS \`m\` 
    ON \`m\`.\`user_key\` = \`cl\`.\`user_key\`  
    
    WHERE \`cl\`.\`company_initial\` = ? 
    AND \`cl\`.\`status\` = ? 
  `, [
    company_initial,
    1
  ]);
  
  
  // 해당 이니셜이 company_list에 존재하지 않는 경우
  if (check_initial_exist.length !== 1) {
    res.json({result:"fail", code:100102});
    return;
  }
  
  
  // 이 api 주소 영업업체의 company 정보
  const best_parent_company_info = check_initial_exist[0];
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // 해당 이니셜이 api키 발급 내역에 존재 하는지 체크
  const check_initial_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`cl\`.\`company_initial\` = ? 
  `, [
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_initial_valid_result.length === 0) {
    // 유효한 업체 이니셜이 아닌 경우
    res.json({result:"fail", code:100131});
    return;
  }
  
  
  
  
  
  
  
  // 필요한 값 받아오기
  const {
    api_key, // api 키
    
    etc1, // api 이용처에서 사용하는 칼럼1
    etc2, // api 이용처에서 사용하는 칼럼2
    
    SEND_TYPE, // 즉시발송, 예약발송 여부 (R = 예약발송)
    DATE, // 발송날짜 (기본값 NOW())
    
    m_user_id, // 문자모아 유저 아이디 (이 계정 정보로 문자가 발송됨, 고객에게 문자를 보내고자 하는 문자모아 계정 아이디)
    // signupcode, // 문자마당에 등록된 효성가입코드 (이 가입코드로 효성 고객인지 아닌지 판별)
    subject, // (선택) LMS, MMS 일 경우 문자제목 (요청하지 않으면 LMS 발송시 자동으로 문자 제목이 [제목없음] 으로 발송됨)
    message, // 보낼 문자 내용
    phone_no, // 수신번호|이름 (, 으로 구분하여 다중 발송 가능) 최대 1천개
    name_replace, // 이름 치환 발송 여부 (Y, N), 이름 부분에 [[[이름]]] 이라고 입력해야 함
    isMMS, // MMS 여부 (Y, N)
    MMS_FILE_URL, // MMS파일 URL 경로
    callback_no, // 발신번호 (문자모아에 등록된 발신번호 이어야 함)
    spam_check, // 수신거부자발송 여부 (기본 값 Y = 수신거부자발송안함) 
    // r_no, // 식당 고유 번호
  } = req.body;
  
  
  
  
  // 값 유효성 검사
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:100161});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:100162});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:100163});
    return;
  }
  
  
  
  // 해당 이니셜과 api키에 매치되는 유효한 api키가 존재하는지 DB에서 체크하기
  const check_access_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\`,
    \`akl\`.\`api_key\` AS \`api_key\`,
    \`akl\`.\`company_seq\` AS \`company_seq\`,
    
    \`cl\`.\`company_name\` AS \`company_name\`,
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    
    \`akl\`.\`created_at\` AS \`created_at\`,
    \`akl\`.\`allow_ip\` AS \`allow_ip\`,
    \`akl\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`akl\`.\`api_key\` = ? 
    AND \`cl\`.\`company_initial\` = ? 
  `, [
    api_key,
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_access_valid_result.length !== 1) {
    // 유효한 API키가 아닌 경우
    res.json({result:"fail", code:100201});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:100202});
    return;
  }
  
  let allow_ip = check_access_valid_result[0].allow_ip;
  let allow_ips = allow_ip.split(',');
  
  // 허용 ip 수 만큼 반복문 돌기
  let is_allow_ip_match = false;
  for (let i=0; i<allow_ips.length; i++) {
    let ip = allow_ips[i]; // ex) 154.22.333.25, 180.255.231.0/24
    let ip_split = ip.split('.');
    let check_ip = '';

    if (ip == '0.0.0.0') {
      is_allow_ip_match = true;
      break;
    }
    
    if (ip.includes('/8')) {
      check_ip = ip_split[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/16')) {
      check_ip = ip_split[0] + '.' + ip_split[1];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/24')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/32')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3].split('/')[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    }
  }
  
  // 요청 ip 주소가 허용 ip 주소에 포함되어 있지 않은 경우
  if (!is_allow_ip_match) {
    res.json({result:"fail", code:100231});
    return;
  }
  
  
  
  
  
  
  
  // etc 처리
  let etc1_value = etc1;
  if (typeof etc1 != "string") {
    etc1_value = "";
  }
  
  let etc2_value = etc2;
  if (typeof etc2 != "string") {
    etc2_value = "";
  }
  
  
  
  
  
  
  
  
  if (typeof m_user_id != "string") {
    res.json({result:"fail", code:100261});
    return;
  }
  
  // if (typeof signupcode != "string") {
  //   res.json({result:"fail", code:100582});
  //   return;
  // }
  
  if (typeof message != "string") {
    res.json({result:"fail", code:100262});
    return;
  }
  
  if (typeof phone_no != "string") {
    res.json({result:"fail", code:100263});
    return;
  }
  
  if (typeof callback_no != "string") {
    res.json({result:"fail", code:100264});
    return;
  }
  
  // if (typeof spam_check != "string") {
  //   res.json({result:"fail", code:100586});
  //   return;
  // }
  
  
  
  
  
  
  
  // (1) signupcode 검사
  
  // // signupcode 값이 정의 되지 않았거나 빈 값인 경우 막기
  // if (isUndefined(signupcode)) {
  //   res.json({result:"fail", code:100502});
  //   return;
  // }
  
  // // signupcode에 특수문자가 들어가 있으면 막기 (가입코드는 문자와 숫자로 이루어져 있기 때문)
  // if (check_regular_express(signupcode, 'special_char')) {
  //   res.json({result:"fail", code:100503});
  //   return;
  // }
  
  // // signupcode 길이가 100자가 아니면 막기 (가입코드는 100자 이므로)
  // if (signupcode.length !== 100) {
  //   res.json({result:"fail", code:100504});
  //   return;
  // }
  
  // // 해당 가입 코드가 효성의 가입코드가 아니면 막기
  // let query2 = `
  //   SELECT 
    
  //   \`mscl\`.\`seq\` AS \`seq\` 
    
  //   FROM \`munjamoa\`.\`member_signup_code_log\` AS \`mscl\` 
    
  //   WHERE \`mscl\`.\`signup_code\` = ? 
  //   AND \`mscl\`.\`status\` = ? 
  // `;
  // let value_array2 = [
  //   signupcode,
  //   1
  // ];
  // const check_signupcode_result = connection.query(
  //   query2,
  //   value_array2
  // );
  
  // if (!check_signupcode_result) {
  //   // 쿼리 실패시 막기
  //   res.json({result:"fail", code:500600});
  //   return;
  // }
  
  // if (check_signupcode_result.length === 0) {
  //   // 해당 가입 코드가 조회되지 않았으면 막기
  //   res.json({result:"fail", code:500601});
  //   return;
  // }
  
  // if (check_signupcode_result.length !== 1) {
  //   // 해당 가입 코드가 1개만 조회된게 아니면 막기
  //   res.json({result:"fail", code:500602});
  //   return;
  // }
  
  // // 조회된 가입코드의 seq 번호
  // const signup_code_seq = check_signupcode_result[0].seq;
  
  // if (signup_code_seq != 3) {
  //   // 조회된 가입코드의 seq 번호가 효성 가입코드의 seq 번호가 아니면 막기
  //   res.json({result:"fail", code:500603});
  //   return;
  // }
  
  // 효성 가입코드가 맞음
  
  
  
  
  
  
  
  
  
  
  // (2) m_user_id 검사
  
  // user_id 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(m_user_id)) {
    res.json({result:"fail", code:100301});
    return;
  }
  
  // 해당 user_id 가 우리 문자모아에 존재하는지 체크 (회원 상태가 정상인 것을 조회)
  let query1 = `
    SELECT 
    
    \`m\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`parent_user_key\` AS \`parent_user_key\`,
    \`m\`.\`user_pay_type\` AS \`user_pay_type\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    \`m\`.\`user_charge_type\` AS \`user_charge_type\`,
    \`m\`.\`signup_code\` AS \`signup_code\`,
    \`m\`.\`cash\` AS \`cash\`,
    
    \`m\`.\`sms_one_price\` AS \`sms_one_price\`,
    \`m\`.\`lms_one_price\` AS \`lms_one_price\`,
    \`m\`.\`mms_one_price\` AS \`mms_one_price\`,
    \`m\`.\`kakao1_one_price\` AS \`kakao1_one_price\`,
    \`m\`.\`kakao2_one_price\` AS \`kakao2_one_price\`,
    \`m\`.\`munja_send_limit_day\` AS \`munja_send_limit_day\`,
    \`m\`.\`munja_send_limit_month\` AS \`munja_send_limit_month\` 
    
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_id\` = ? 
    AND \`m\`.\`user_status\` = ? 
  `;
  let value_array1 = [
    m_user_id,
    1
  ];
  const check_member_exist_result = connection.query(
    query1,
    value_array1
  )
  
  if (!check_member_exist_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:100331});
    return;
  }
  
  if (check_member_exist_result.length === 0) {
    // 해당 회원 정보가 없으면 막기
    res.json({result:"fail", code:100332});
    return;
  }
  
  if (check_member_exist_result.length !== 1) {
    // 해당 회원 정보가 1개가 아니면 막기
    res.json({result:"fail", code:100333});
    return;
  }
  
  
  
  
  const user_info = check_member_exist_result[0];
  
  
  
  // API는 기업계정만 이용 가능한데, 조회된 회원은 기업 계정이 아닌 경우
  if (user_info.user_type != 2) {
    res.json({result: "fail", code: 100361})
    return;
  }
  
  
  
  
  
  
  // 조회된 회원의 가입코드
  const user_signupcode = check_member_exist_result[0].signup_code;
  
  // 조회된 회원의 캐쉬
  const user_cash = check_member_exist_result[0].cash;
  
  // 조회된 회원의 고유 키
  const user_key = check_member_exist_result[0].user_key;
  
  // 조회된 회원의 부모 회원 키
  const parent_user_key = check_member_exist_result[0].parent_user_key;
  
  // 조회된 회원 지불 유형 (선불 인지 후불인지)
  const user_pay_type = check_member_exist_result[0].user_pay_type;
  
  // 조회된 회원의 청구 유형
  const user_charge_type = check_member_exist_result[0].user_charge_type;
  
  // if (user_pay_type == 2) {
  //   // 조회된 회원이 후블 회원이면 막기
  //   res.json({result:"fail", code:500705});
  //   return;
  // }
  
  
  // if (user_signupcode != signupcode) {
  //   // POST 요청온 가입코드와 조회된 회원의 가입코드가 일치하지 않으면 막기
  //   res.json({result:"fail", code:500706});
  //   return;
  // }
  
  // user_id는 존재하는 회원이고 해당 가입코드로 가입된 회원도 맞음.
  
  
  
  
  
  
  
  
  
  // (3) message 검사
  
  // message 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(message)) {
    res.json({result:"fail", code:100401});
    return;
  }
  
  
  
  
  // 문자 내용에 금지 단어가 포함되어 있는지 체크하기
  const cut_word_list = connection.query(`
    SELECT 
    
    \`mwcli\`.\`seq\` AS \`seq\`,
    \`mwcli\`.\`cut_word_json_string\` AS \`cut_word_json_string\`,
    \`mwcli\`.\`created_at\` AS \`created_at\`,
    \`mwcli\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`munja_word_cut_limit_log\` AS \`mwcli\` 
    
    WHERE \`mwcli\`.\`status\` = ? 
    
    ORDER BY \`mwcli\`.\`created_at\` DESC 
    
    LIMIT 1
  `, [
    1
  ]);
  
  let cur_word_list_array = [];
  
  if (cut_word_list.length == 1) {
    const cut_word_list_json = cut_word_list[0].cut_word_json_string;
    try {
      cur_word_list_array = JSON.parse(cut_word_list_json);
    } catch(e) {
      console.error(e);
    }
  }
  
  // 문자 내용에 금지 단어 있는 경우 막기
  for (let i=0; i<cur_word_list_array.length; i++) {
    let item = cur_word_list_array[i];
    
    if (message.includes(item.word)) {
      res.json({result:"fail", code: 100431, catch_word:item.word});
      return;
    }
  }
  
  
  
  
  
  let Msg_Type = 4; // sms
  let munja_type = 1; // sms
  let munja_type_string = 'sms'; // sms
  
  if (stringByteCheck(message) > 90) {
    // 문자 내용이 90바이트가 넘어가면 lms
    Msg_Type = 6; // lms
    munja_type = 2; // lms
    munja_type_string = 'lms'; // lms
  }
  
  if (message.length > 2000) {
    // 문자 내용 길이가 2000자가 넘어가면 막기
    res.json({result:"fail", code:100461});
    return;
  }
  
  // 문자 내용에 대한 Msg_Type 설정 완료.
  
  
  
  // isMMS 체크
  let mms_file_url = '';
  if (isMMS == 'Y') {
    Msg_Type = 6; // mms
    munja_type = 3; // mms
    munja_type_string = 'mms'; // mms
    
    if (typeof MMS_FILE_URL == "string") {
      if (MMS_FILE_URL.length > 4) {


        mms_file_url = MMS_FILE_URL;




        let header_miss = '';
        let extension_miss = '';

        await axios.get(mms_file_url, { 
          responseType:'stream',
        }).then(async(res) => {

          // 파일 확장자
          var allow_file_types = [
            'jpg', 'JPG', 'jpeg', 'JPEG'
          ];

          // 'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'

          // 헤더에서 파일 확장자명 추출 :: 간혹 URL의 확장자와 실제 파일의 확장자가 다른 경우 존재
          console.log(`콘텐츠타입 : ${res.headers['content-type']}`);
          let fileType = `${res.headers['content-type'].split('/')[1]}`;

          let headerUrl = `${res.config['url']}`;




          // 받은 URL과 Header의 URL이 일치하지 않는 경우 실패처리
          console.log('header URL ====== ', headerUrl);

          if(mms_file_url != headerUrl){

            header_miss = 'hm';

          }




          // 파일 확장자 체크 :: 추출한 확장자가 존재하지 않는다면
          if(!allow_file_types.includes(fileType)){
            
            extension_miss = 'em';

          // 파일 확장자 체크 :: 추출한 확장자가 존재한다면
          }else{

            // 서버에 저장될 파일명 재조립

            // 1. URL에 파일 확장자 유무 체크
            let fileType2 = headerUrl.split('.').reverse()[0];


            // 0. URL에서 파일 이미지명 추출 
            let fileNameUrl = headerUrl.split('/').reverse()[0];
            console.log('fileNameUrl => ', fileNameUrl);


            // URL에 ?가 있는지 검색.
            if(fileNameUrl.indexOf('?') != -1){
              // 물음표가 있으면 파일 이름을 무작위로 변경.
              fileNameUrl = getRandomString(5);
            }


            if(!allow_file_types.includes(fileType2)){

              // console.log('URL에 파일 확장자가 존재하지 않음. 헤더 확장자 붙임.');
              // 2-A. 확장자를 붙여서 패턴대로 저장
              var filename = getRandomString(5) + new Date().getTime() + '_' + fileNameUrl + '.' + fileType;

            }else{

              // console.log('URL에 파일 확장자가 존재함.');
              // 2-B. 별도 작업 없이 패턴대로 저장
              var filename = getRandomString(5) + new Date().getTime() + '_' + fileNameUrl;

            }


            console.log('result :: filename => ', filename);


            // 동기처리. 파일이 서버에 저장되기전에 끝나지 않음.
            await new Promise(function(resolve, reject){
            
              const pipe = request(headerUrl).pipe(fs.createWriteStream(`../file/upload/${filename}`));

              pipe.on("finish", function() {
                resolve();
                console.log(fs.existsSync(`../file/upload/${filename}`));
              });

            }); 


            mms_file_url = path.join(__dirname, '..', '..', 'file', 'upload/', filename);


          }

          

        }).catch(`이미지 다운로드 요청 실패`);


        // Axios 통신 종료
        console.log('Axios 통신 종료');
        



        if(header_miss == 'hm'){
          // 받은 URL과 헤더의 URL이 일치하지 않음.
          res.json({result:"fail", code:100901});
          return;
        }
        
        
        if(extension_miss == 'em'){
          // 실패. 해당하는 확장자가 아님.
          res.json({result:"fail", code:100902});
          return;
        }


      }
    }
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (typeof SEND_TYPE != "string") {
    
  }
  
  let send_type = 1; // 즉시발송
  let real_send_time = getCurrentMomentDatetime();  
  if (SEND_TYPE == 'R') {
    // 예약발송일 경우
    
    // DATE 변수에는 2019-12-25 13:00 이런식으로 년월일 시분 까지만 입력되어야 함. (초 제외)
    
    if (!is_datetime_string(DATE + ':00')) {
      // 예약발송인데 날짜가 날짜형식이 아닌 경우
      res.json({result:"fail", code:100501});
      return;
    }
    
    
    if (!moment(DATE + ':00').isValid()) {
      // 예약발송인데 날짜가 유효한 날짜가 아닌 경우
      res.json({result:"fail", code:100502});
      return;
    }
    
    
    if ((new Date(DATE + ':00')).getTime() <= (new Date(getCurrentMomentDatetime())).getTime()) {
      // 예약발송인데 날짜가 현재날짜보다 작거나 같은 경우
      res.json({result:"fail", code:100503});
      return;
    }
    
    
    real_send_time = DATE + ':00';
    
    
    send_type = 2; // 예약발송
  } else {
    // 예약발송 아니면 현재날짜로 셋팅
    
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // (3.5) subject 검사
  let munja_subject = '';
  if (typeof subject != "string") {
    munja_subject = '제목없음';
  } else {
    munja_subject = subject;
  }
  
  
  
  
  
  
  
  
  
  
  
  // (4) phone_no (수신번호) 검사
  
  // phone_no 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(phone_no)) {
    res.json({result:"fail", code:100531});
    return;
  }
  
  let all_getter_person_list = [];
  let getter_person_list = [];
  let bad_person_list = [];
  const phone_no_array = phone_no.split(',');
  if (phone_no_array.length > 1000) {
    // 수신자 수가 1000명을 넘은 경우
    res.json({result:"fail", code:100532});
    return;
  }
  
  for (let i=0; i<phone_no_array.length; i++) {
    let item = phone_no_array[i];
    let item_split = item.split('|');
    let getter_phone = item_split[0].replace(/-/gi, ''); // ex) 01012341234
    let getter_name = item_split[1]; // ex) 홍길동
    
    if (typeof getter_name != "string") {
      getter_name = "";
    }
    
    
    all_getter_person_list.push({
      getter_name: getter_name,
      getter_phone: getter_phone,
    });
    
    if (!check_regular_express(getter_phone, 'number_only')) {
      // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호가 숫자로만 이루어 진 문자가 아닌 경우 막기
      bad_person_list.push({
        getter_name: getter_name,
        getter_phone: getter_phone,
      });
      continue;
    }
    
    if (getter_phone.length > 12) {
      // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호 길이가 12자보다 크면 막기
      bad_person_list.push({
        getter_name: getter_name,
        getter_phone: getter_phone,
      });
      continue;
    }
    
    
    getter_person_list.push({
      getter_name: getter_name,
      getter_phone: getter_phone,
    });
  }
  
  // 실 수신자 수가 0이면 막기
  if (getter_person_list.length == 0) {
    res.json({result:"fail", code:100561});
    return;
  }
  
  
  
  // let phone_no_original = phone_no;
  // let phone_no_line_remove = phone_no.replace(/-/gi, "");
  
  // if (!check_regular_express(phone_no_line_remove, 'number_only')) {
  //   // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호가 숫자로만 이루어 진 문자가 아닌 경우 막기
  //   res.json({result:"fail", code:500902});
  //   return;
  // }
  
  // if (phone_no_line_remove.length > 11) {
  //   // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호 길이가 11자보다 크면 막기
  //   res.json({result:"fail", code:500903});
  //   return;
  // }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // (5) callback_no (발신번호) 검사
  
  // callback_no 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(callback_no)) {
    res.json({result:"fail", code:100601});
    return;
  }
  
  let callback_no_original = callback_no;
  let callback_no_line_remove = callback_no.replace(/-/gi, "");
  
  if (!check_regular_express(callback_no_line_remove, 'number_only')) {
    // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호가 숫자로만 이루어 진 문자가 아닌 경우 막기
    res.json({result:"fail", code:100602});
    return;
  }
  
  if (callback_no_line_remove.length > 11) {
    // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호 길이가 11자보다 크면 막기
    res.json({result:"fail", code:100603});
    return;
  }
  
  // 해당 회원에 해당발신번호가 등록되어 있는지 체크하기
  const check_callback_no_result = connection.query(`
    SELECT
    
    \`msnl\`.\`seq\` AS \`seq\` 
    
    FROM \`munjamoa\`.\`member_send_number_log\` AS \`msnl\` 
    
    WHERE \`msnl\`.\`user_key\` = ?  
    AND REPLACE(\`msnl\`.\`send_number\`, '-', '') = REPLACE(?, '-', '') 
    AND \`msnl\`.\`status\` = ? 
  `, [
    user_key,
    callback_no,
    1
  ]);
  
  // 조회된 발신번호가 1개가 아니면 막기
  if (check_callback_no_result.length !== 1) {
    // 문자모아에 사전 등록된 발신번호가 아닌 경우
    res.json({result:"fail", code:100631});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  // (7) spam_check 검사
  
  // if (spam_check != 'Y' && spam_check != 'N') {
  //   // spam_check 값이 Y도 아니고 N도 아니면 막기
  //   res.json({result:"fail", code:501201});
  //   return;
  // }
  
  let deny_send_flag = 1; // 수신거부자 발송하지 않음
  if (spam_check == 'N') {
    deny_send_flag = 2; // 수신거부자 상관없이 발송함
  }
  
  
  
  
  
  
  
  
  
  
  
  
  // spam_check가 Y이면 
  let deny_clear_getter_person_list = [];
  let deny_person_list = [];
  if (spam_check == 'Y') {
    // 수신거부 등록 리스트 전체 가져오기
    let get_all_reception_deny_log_result = connection.query(`
      SELECT 
      
      \`rdl\`.\`apply_phone_number\` AS \`apply_phone_number\`, 
      \`rdl\`.\`target_phone_number\` AS \`target_phone_number\` 
      
      FROM \`munjamoa\`.\`reception_deny_log\` AS \`rdl\` 
      
      WHERE \`rdl\`.\`status\` = ? 
      AND \`rdl\`.\`user_key\` = ? 
    `, [
      1,
      user_key
    ]);
    
    // 쿼리 실패시 막기
    if (!get_all_reception_deny_log_result) {
      res.json({result: "fail", code: 100661});
      return;
    }
    
    
    // 수신거부등록 내역 리스트 생성
    let all_reception_deny_list = [];
    for (let i=0; i<get_all_reception_deny_log_result.length; i++) {
      all_reception_deny_list.push({
        apply_phone_number: get_all_reception_deny_log_result[i].apply_phone_number,
        target_phone_number: get_all_reception_deny_log_result[i].target_phone_number,
      });
    }
    
    
    // 실 수신자 수만큼 반복문 돌기
    for (let i=0; i<getter_person_list.length; i++) {
      var getter_name = getter_person_list[i].getter_name;
      var getter_phone = getter_person_list[i].getter_phone;
      
      var is_deny = false;
      for (let k=0; k<all_reception_deny_list.length; k++) {
        if (all_reception_deny_list[k].apply_phone_number == getter_phone && all_reception_deny_list[k].target_phone_number == callback_no) {
          is_deny = true;
          break;
        }
      }
      
      // 수신거부목록에 있으면 수신거부자 리스트에 추가 하고 다음으로 넘어가기 
      if (is_deny) {
        deny_person_list.push({
          getter_name: getter_name,
          getter_phone: getter_phone
        });
        continue;
      }
      
      // 수신거부목록에 없으면 수신거부하지 않은 리스트에 추가하고 다음으로 넘어가기
      deny_clear_getter_person_list.push({
        getter_name: getter_name,
        getter_phone: getter_phone
      });
    }
  } else {
    deny_clear_getter_person_list = getter_person_list;
  }
  
  
  
  
  
  // 변수 값 정리~~~
  // 원래 보내려 한 수신자들, all_getter_person_list
  // 형식에 맞지 않는 수신자들, bad_person_list
  // 실 수신자들, getter_person_list
  // 수신거부 수신자들, deny_person_list
  // 수신거부 필터링된 실 수신자들, deny_clear_getter_person_list
  
  
  
  
  
  
  
  
  
  
  
  // 건수 제한 정보 가져와 넘었는지 아닌지 체크하기
  const munja_send_limit_info = connection.query(`
    SELECT 
    
    \`m\`.\`munja_send_limit_day\` AS \`munja_send_limit_day\`,
    \`m\`.\`munja_send_limit_month\` AS \`munja_send_limit_month\` 
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_key\` = ? 
  `, [
    user_key
  ]);
  
  // 해당 회원에서 보낸 건수 정보 가져오기
  
  // 오늘 보낸 문자 총 건수 가져오기
  let year = (new Date()).getFullYear();
  let month = (new Date()).getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  const msg_log_table_name = 'Msg_Log_' + year + month;
  console.log('today_and_month_total_send_num search target table = '. msg_log_table_name);
  const check_one_day_send_munja = connection.query(`
    SELECT 
    
    \`ml\`.\`Msg_Id\` AS \`Msg_Id\` 
    
    FROM \`munjamoa\`.\`${msg_log_table_name}\` AS \`ml\` 
    
    WHERE \`ml\`.\`user_key\` = ? 
    AND (\`ml\`.\`Send_Time\` >= ? AND \`ml\`.\`Send_Time\` <= ?) 
  `, [
    user_key,
    to_datetime(getCurrentMomentDatetime()).onlyDate + ' ' + '00:00:00',
    to_datetime(getCurrentMomentDatetime()).onlyDate + ' ' + '23:59:59',
  ]);
  
  const today_total_send_num = check_one_day_send_munja.length; // 오늘 보낸 문자 총 수
  // 일 제한건수를 넘겼으면 막기
  if (munja_send_limit_info[0].munja_send_limit_day < today_total_send_num + deny_clear_getter_person_list.length) {
    res.json({result:"fail", code:100671});
    return;
  }
  
  
  
  // 이번달 보낸 문자 총 건수 가져오기
  const check_month_send_munja = connection.query(`
    SELECT 
    
    \`ml\`.\`Msg_Id\` AS \`Msg_Id\` 
    
    FROM \`munjamoa\`.\`${msg_log_table_name}\` AS \`ml\` 
    
    WHERE \`ml\`.\`user_key\` = ? 
    AND (\`ml\`.\`Send_Time\` >= ? AND \`ml\`.\`Send_Time\` <= ?) 
  `, [
    user_key,
    to_datetime(getCurrentMomentDatetime()).first_datetime,
    to_datetime(getCurrentMomentDatetime()).last_datetime,
  ]);
  
  const today_month_send_num = check_month_send_munja.length; // 이번 달 보낸 문자 총 수
  // 월 제한건수를 넘겼으면 막기
  if (munja_send_limit_info[0].munja_send_limit_month < today_month_send_num + deny_clear_getter_person_list.length) {
    res.json({result:"fail", code:100672});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // 문자 내용에서 url 값 추출해내기
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // 건당 요금 책정
  let one_price = 1000000;
  switch (munja_type) {
    case 1: // sms
      one_price = user_info.sms_one_price;
      break;
    case 2: // lms
      one_price = user_info.lms_one_price;
      break;
    case 3: // mms
      one_price = user_info.mms_one_price;
      break;
    default:
      // code
  }
  
  
  
  
  
  
  
  
  // 예상 금액 책정
  const will_pay_cash = one_price * deny_clear_getter_person_list.length;
  
  
  
  // 선불 회원이면 체크
  if (user_pay_type == 1) {
    // 현재 회원의 캐쉬 잔액이 예상 금액 보다 적으면 막기
    if (user_cash < will_pay_cash) {
      res.json({
        result:"fail", 
        code: 100701,
        current_cash: user_cash,
        pay_cash: will_pay_cash
      });
      return;
    }
  }
  
  
  
  
  // 효성의 API 코드
  // const api_code = 100;
  
  
  
  
  // 문자 발송 시작 (트랜잭션 필요)
  
  
  
  // 문자 토큰문자열 생성
  const new_munja_token = getMakeToken(100);
  
  
  // 트랜잭션 시작
  let autocommit_false = connection.query(`
    SET AUTOCOMMIT = FALSE;
  `);
  let transaction_start = connection.query(`
    START TRANSACTION;
  `);
  
  
  
  try {
    // (1) 문자 발송 테이블에 INSERT
    let send_munja_query_result = false;
    switch (munja_type) {
      case 1: // sms 이면
        let send_munja_query_sms = '';
        let send_munja_query_sms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_query_sms += `
            INSERT INTO \`munjamoa\`.\`Msg_Tran\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Message\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`,
             \`etc1\`, \`etc2\`, \`company_seq\`)VALUES
            
            (?, ?, ?, 
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?);
          `;
          send_munja_query_sms_values.push(real_phone);
          send_munja_query_sms_values.push(callback_no);
          send_munja_query_sms_values.push(real_content);
          
          send_munja_query_sms_values.push(real_send_time);
          send_munja_query_sms_values.push(real_send_time);
          send_munja_query_sms_values.push(Msg_Type);
          send_munja_query_sms_values.push(getCurrentMomentDatetime());
          
          send_munja_query_sms_values.push(new_munja_token);
          send_munja_query_sms_values.push(user_key);
          send_munja_query_sms_values.push(api_key);
          send_munja_query_sms_values.push(user_signupcode);
          
          send_munja_query_sms_values.push(etc1_value);
          send_munja_query_sms_values.push(etc2_value);
          send_munja_query_sms_values.push(best_parent_company_info.seq);
        }
        
        send_munja_query_result = connection.query(send_munja_query_sms, send_munja_query_sms_values);
        break;
      case 2: // lms 이면
        let send_munja_query_lms = '';
        let send_munja_query_lms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_query_lms += `
            INSERT INTO \`munjamoa\`.\`Msg_Tran\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`,
             \`etc1\`, \`etc2\`, \`company_seq\`)VALUES
            
            (?, ?, ?, ?, 
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?);
          `;
          send_munja_query_lms_values.push(real_phone);
          send_munja_query_lms_values.push(callback_no);
          send_munja_query_lms_values.push(munja_subject);
          send_munja_query_lms_values.push(real_content);
          
          send_munja_query_lms_values.push(real_send_time);
          send_munja_query_lms_values.push(real_send_time);
          send_munja_query_lms_values.push(Msg_Type);
          send_munja_query_lms_values.push(getCurrentMomentDatetime());
          
          send_munja_query_lms_values.push(new_munja_token);
          send_munja_query_lms_values.push(user_key);
          send_munja_query_lms_values.push(api_key);
          send_munja_query_lms_values.push(user_signupcode);
          
          send_munja_query_lms_values.push(etc1_value);
          send_munja_query_lms_values.push(etc2_value);
          send_munja_query_lms_values.push(best_parent_company_info.seq);
        }
          
        send_munja_query_result = connection.query(send_munja_query_lms, send_munja_query_lms_values);
        break;
      case 3: // mms 이면
        let send_munja_query_mms = '';
        let send_munja_query_mms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_query_mms += `
            INSERT INTO \`munjamoa\`.\`Msg_Tran\`
            
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, 
            \`File_Count\`, \`File_Type1\`, \`File_Name1\`, \`api_key\`,
            \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
            \`munja_token\`, \`user_key\`, \`at_signup_code\`, \`company_seq\`,
            \`etc1\`, \`etc2\`)VALUES
            
            (?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?);
          `;
          
          send_munja_query_mms_values.push(real_phone);
          send_munja_query_mms_values.push(callback_no);
          send_munja_query_mms_values.push(munja_subject); 
          send_munja_query_mms_values.push(real_content);
          
          send_munja_query_mms_values.push(1); 
          send_munja_query_mms_values.push('IMG');
          send_munja_query_mms_values.push(mms_file_url);
          send_munja_query_mms_values.push(api_key);
          
          send_munja_query_mms_values.push(real_send_time);
          send_munja_query_mms_values.push(real_send_time);
          send_munja_query_mms_values.push(Msg_Type);
          send_munja_query_mms_values.push(getCurrentMomentDatetime());
          
          send_munja_query_mms_values.push(new_munja_token);
          send_munja_query_mms_values.push(user_key);
          send_munja_query_mms_values.push(user_signupcode);
          send_munja_query_mms_values.push(best_parent_company_info.seq);
          
          send_munja_query_mms_values.push(etc1_value);
          send_munja_query_mms_values.push(etc2_value);
        }
          
        send_munja_query_result = connection.query(send_munja_query_mms, send_munja_query_mms_values);
        break;
    }
    
 
    
    
    // 선불 회원이면 차감
    let member_cash_log_insert_result = true;
    let member_cash_change_result = true;
    if (user_info.user_pay_type == 1) {
      // 캐쉬 로그 남기기 (2)
      member_cash_log_insert_result = connection.query(`
        INSERT INTO \`munjamoa\`.\`member_cash_log\`
        (\`user_key\`, \`plus_or_minus\`, \`cash\`, \`log_type\`, \`created_at\`, \`memo\`)VALUES
        (?, ?, ?, ?, ?, ?)
      `, [
        user_key,
        '-',
        will_pay_cash,
        1,
        getCurrentMomentDatetime(),
        `(api : ${company_initial}) ${munja_type_string} ${deny_clear_getter_person_list.length}건 문자 발송`
      ]);
      
      // 캐쉬 차감하기 (3)
      member_cash_change_result = connection.query(`
        UPDATE \`munjamoa\`.\`member\` SET 
        \`cash\` = \`cash\` - ? 
        
        WHERE \`user_key\` = ? 
        AND \`user_status\` = ? 
      `, [
        will_pay_cash,
        user_key,
        1
      ]);
    }
    
    
    
    
    
    
    
    
    // munja_send_group_log 남기기 (4)
    // api url의 주체 업체인 user_key가 at_parent_user_key 값에 들어간다.
    let munja_send_group_log_result = connection.query(`
      INSERT INTO \`munjamoa\`.\`munja_send_group_log\` 
    
      (\`munja_token\`, \`user_key\`, \`send_type\`,
       \`Send_Time\`, \`Subject\`, \`Message\`, 
       \`munja_type\`, \`Callback_No\`, \`mms_file1_name\`,
       \`deny_send_flag\`, \`mms_file1_path\`, \`created_at\`,
       \`original_send_count\`, \`deny_getter_count\`, \`request_ip\`,
       \`at_user_pay_type\`, \`at_user_one_price\`, \`api_key\`,
       \`at_user_charge_type\`, \`at_parent_user_key\`, \`at_signup_code\`,
       \`company_seq\`)VALUES
      
      (?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?, ?, ?,
       ?);
    `, [
      new_munja_token, user_key, send_type,
      real_send_time, munja_subject, message,
      munja_type, callback_no_line_remove, ' ',
      deny_send_flag, ' ', getCurrentMomentDatetime(),
      deny_clear_getter_person_list.length, deny_person_list.length, requestIP.getClientIp(req),
      user_pay_type, one_price, api_key,
      user_charge_type, best_parent_company_info.user_key, user_signupcode,
      best_parent_company_info.seq
    ]);
    
    
    
    
    
    
    
    if (!send_munja_query_result || !member_cash_log_insert_result || !member_cash_change_result || !munja_send_group_log_result) {
      // 하나라도 쿼리 에러 난거 있으면 ROLLBACK; 하기
      let transaction_rollback2 = connection.query(`
        ROLLBACK;
      `);
      
      let autocommit_true2 = connection.query(`
      	SET AUTOCOMMIT = TRUE;
      `);
      
      res.json({result: "fail", code: 100731});
      return;
    } 
    
    
    
    
    // 모두 정상적으로 진행 되었으면 (문자발송, 캐쉬로그, 캐쉬차감, munja_send_group_log 모두 정상 이면)
    let transaction_commit_result = connection.query(`
      COMMIT;
    `);
    
    let autocommit_true1 = connection.query(`
    	SET AUTOCOMMIT = TRUE;
    `);





    let send_munja_list_up_query_result = false;
    switch (munja_type) {
      case 1: // sms 이면
        let send_munja_list_up_query_sms = '';
        let send_munja_list_up_query_sms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_list_up_query_sms += `
            INSERT INTO \`munjamoa\`.\`munja_send_group_log_list_up\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Message\`, \`Name\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`,
             \`etc1\`, \`etc2\`, \`company_seq\`)VALUES
            
            (?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?);
          `;
          send_munja_list_up_query_sms_values.push(real_phone);
          send_munja_list_up_query_sms_values.push(callback_no);
          send_munja_list_up_query_sms_values.push(real_content);
          send_munja_list_up_query_sms_values.push(real_name);
          
          send_munja_list_up_query_sms_values.push(real_send_time);
          send_munja_list_up_query_sms_values.push(real_send_time);
          send_munja_list_up_query_sms_values.push(Msg_Type);
          send_munja_list_up_query_sms_values.push(getCurrentMomentDatetime());
          
          send_munja_list_up_query_sms_values.push(new_munja_token);
          send_munja_list_up_query_sms_values.push(user_key);
          send_munja_list_up_query_sms_values.push(api_key);
          send_munja_list_up_query_sms_values.push(user_signupcode);
          
          send_munja_list_up_query_sms_values.push(etc1_value);
          send_munja_list_up_query_sms_values.push(etc2_value);
          send_munja_list_up_query_sms_values.push(best_parent_company_info.seq);
        }
        
        send_munja_list_up_query_result = connection.query(send_munja_list_up_query_sms, send_munja_list_up_query_sms_values);
        break;
      case 2: // lms 이면
        let send_munja_list_up_query_lms = '';
        let send_munja_list_up_query_lms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_list_up_query_lms += `
            INSERT INTO \`munjamoa\`.\`munja_send_group_log_list_up\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, \`Name\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`,
             \`etc1\`, \`etc2\`, \`company_seq\`)VALUES
            
            (?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?);
          `;
          send_munja_list_up_query_lms_values.push(real_phone);
          send_munja_list_up_query_lms_values.push(callback_no);
          send_munja_list_up_query_lms_values.push(munja_subject);
          send_munja_list_up_query_lms_values.push(real_content);
          send_munja_list_up_query_lms_values.push(real_name);
          
          send_munja_list_up_query_lms_values.push(real_send_time);
          send_munja_list_up_query_lms_values.push(real_send_time);
          send_munja_list_up_query_lms_values.push(Msg_Type);
          send_munja_list_up_query_lms_values.push(getCurrentMomentDatetime());
          
          send_munja_list_up_query_lms_values.push(new_munja_token);
          send_munja_list_up_query_lms_values.push(user_key);
          send_munja_list_up_query_lms_values.push(api_key);
          send_munja_list_up_query_lms_values.push(user_signupcode);
          
          send_munja_list_up_query_lms_values.push(etc1_value);
          send_munja_list_up_query_lms_values.push(etc2_value);
          send_munja_list_up_query_lms_values.push(best_parent_company_info.seq);
        }
          
        send_munja_list_up_query_result = connection.query(send_munja_list_up_query_lms, send_munja_list_up_query_lms_values);
        break;
      case 3: // mms 이면
        let send_munja_list_up_query_mms = '';
        let send_munja_list_up_query_mms_values = [];
        
        // 실 수신자수 만큼 반복문 돌기
        for (let i=0; i<deny_clear_getter_person_list.length; i++) {
          let real_name = deny_clear_getter_person_list[i].getter_name;
          let real_phone = deny_clear_getter_person_list[i].getter_phone;
          
          let real_content = message;
          if (name_replace == 'Y') {
            real_content = message.replace(/\[\[\[이름\]\]\]/gi, real_name);
          }
          
          send_munja_list_up_query_mms += `
            INSERT INTO \`munjamoa\`.\`munja_send_group_log_list_up\`
            
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, \`Name\`, 
            \`File_Count\`, \`File_Type1\`, \`File_Name1\`, \`api_key\`,
            \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
            \`munja_token\`, \`user_key\`, \`at_signup_code\`, \`company_seq\`,
            \`etc1\`, \`etc2\`)VALUES
            
            (?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?);
          `;
          
          send_munja_list_up_query_mms_values.push(real_phone);
          send_munja_list_up_query_mms_values.push(callback_no);
          send_munja_list_up_query_mms_values.push(munja_subject); 
          send_munja_list_up_query_mms_values.push(real_content);
          send_munja_list_up_query_mms_values.push(real_name);
          
          send_munja_list_up_query_mms_values.push(1); 
          send_munja_list_up_query_mms_values.push('IMG');
          send_munja_list_up_query_mms_values.push(mms_file_url);
          send_munja_list_up_query_mms_values.push(api_key);
          
          send_munja_list_up_query_mms_values.push(real_send_time);
          send_munja_list_up_query_mms_values.push(real_send_time);
          send_munja_list_up_query_mms_values.push(Msg_Type);
          send_munja_list_up_query_mms_values.push(getCurrentMomentDatetime());
          
          send_munja_list_up_query_mms_values.push(new_munja_token);
          send_munja_list_up_query_mms_values.push(user_key);
          send_munja_list_up_query_mms_values.push(user_signupcode);
          send_munja_list_up_query_mms_values.push(best_parent_company_info.seq);
          
          send_munja_list_up_query_mms_values.push(etc1_value);
          send_munja_list_up_query_mms_values.push(etc2_value);
        }
          
        send_munja_list_up_query_result = connection.query(send_munja_list_up_query_mms, send_munja_list_up_query_mms_values);
        break;
    }

    
    
    
    
    
    // 해당 user의 현재 잔여 캐쉬 값 가져오기
    let query4 = `
      SELECT 
      
      \`m\`.\`cash\` AS \`cash\` 
      
      FROM \`munjamoa\`.\`member\` AS \`m\` 
      
      WHERE \`m\`.\`user_key\` = ? 
      AND \`m\`.\`user_status\` = ? 
    `;
    let value_array4 = [
      user_key,
      1
    ];
    const check_member_cash_result = connection.query(
      query4,
      value_array4
    )
    
    if (!check_member_cash_result) {
      // 쿼리 실패시 막기
      res.json({result:"fail", code:100761});
      return;
    }
    
    const current_cash = check_member_cash_result[0].cash;
    
    
    
    
    
    if (user_pay_type == 1) {
      // 선불인 경우
      res.json({
        result: "success", // 결과
        message_type: munja_type_string, // 문자 티입 (sms, lms, mms)
        one_price: one_price, // 건당 가격
        pay_cash: will_pay_cash, // 차감된 캐쉬
        current_cash: current_cash, // 현재 남은 캐쉬
        mt: new_munja_token, // 문자 고유 키 값 (추후 이 키를 이용하여 문자 발송 성공, 실패 여부 확인 가능)
        bad_info: bad_person_list, // 수신자 정보중 형식에 올바르지 않는 정보 (발송되지 않은 건)
        deny_count: deny_person_list.length, // 수신거부자 수 (발송되지 않은 건)
      });
    } else {
      // 후불인 경우
      res.json({
        result: "success", // 결과
        message_type: munja_type_string, // 문자 티입 (sms, lms, mms)
        one_price: one_price, // 건당 가격
        pay_cash: 0, // 차감된 캐쉬
        current_cash: current_cash, // 현재 남은 캐쉬
        mt: new_munja_token, // 문자 고유 키 값 (추후 이 키를 이용하여 문자 발송 성공, 실패 여부 확인 가능)
        bad_info: bad_person_list, // 수신자 정보중 형식에 올바르지 않는 정보 (발송되지 않은 건)
        deny_count: deny_person_list.length, // 수신거부자 수 (발송되지 않은 건)
      });
    }
    return;
    
    
    
  } catch (e) {
    console.log('code : 501600');
    console.log(e);
    console.error(e);
    let transaction_rollback2 = connection.query(`
      ROLLBACK;
    `);
    
    let autocommit_true1 = connection.query(`
    	SET AUTOCOMMIT = TRUE;
    `);

    
    res.json({result:"fail", code:100801});
    return;
  }
}));


















// 보낸 문자에 대한 상태 값 조회
router.post('/:company_initial/statusMsg', function(req, res, next) {
  // if (!allow_ip_address_list.includes(requestIP.getClientIp(req))) {
  //   // 효성 IP 주소가 아니면 막기
  //   res.json({result:"fail", code:100501});
  //   return;  
  // }
  
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn 또는 hyoseong
  
  
  
  // 해당 이니셜이 api키 발급 내역에 존재 하는지 체크
  const check_initial_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`cl\`.\`company_initial\` = ? 
  `, [
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_initial_valid_result.length === 0) {
    // 유효한 업체 이니셜이 아닌 경우
    res.json({result:"fail", code:200101});
    return;
  }
  
  
  
  
  
  
  
  // 필요한 값 받아오기
  const {
    api_key,
    m_user_id, // 문자모아 유저 아이디
    mt // 문자 고유 번호
  } = req.body;
  
  
  
  
  // 값 유효성 검사
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:200131});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:200132});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:200133});
    return;
  }
  
  
  
  // 해당 이니셜과 api키에 매치되는 유효한 api키가 존재하는지 DB에서 체크하기
  const check_access_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\`,
    \`akl\`.\`api_key\` AS \`api_key\`,
    \`akl\`.\`company_seq\` AS \`company_seq\`,
    
    \`cl\`.\`company_name\` AS \`company_name\`,
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    
    \`akl\`.\`created_at\` AS \`created_at\`,
    \`akl\`.\`allow_ip\` AS \`allow_ip\`,
    \`akl\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`akl\`.\`api_key\` = ? 
    AND \`cl\`.\`company_initial\` = ? 
  `, [
    api_key,
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_access_valid_result.length !== 1) {
    // 유효한 API키가 아닌 경우
    res.json({result:"fail", code:200161});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:200162});
    return;
  }
  
  let allow_ip = check_access_valid_result[0].allow_ip;
  let allow_ips = allow_ip.split(',');
  
  // 허용 ip 수 만큼 반복문 돌기
  let is_allow_ip_match = false;
  for (let i=0; i<allow_ips.length; i++) {
    let ip = allow_ips[i]; // ex) 154.22.333.25, 180.255.231.0/24
    let ip_split = ip.split('.');
    let check_ip = '';
    
    if (ip.includes('/8')) {
      check_ip = ip_split[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/16')) {
      check_ip = ip_split[0] + '.' + ip_split[1];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/24')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/32')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3].split('/')[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    }
  }
  
  // 요청 ip 주소가 허용 ip 주소에 포함되어 있지 않은 경우
  if (!is_allow_ip_match) {
    res.json({result:"fail", code:200201});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // m_user_id 검사
  if (typeof m_user_id != "string") {
    res.json({result:"fail", code:200231});
    return;
  }
  
  // 해당 user_id 가 우리 문자모아에 존재하는지 체크 (회원 상태가 정상인 것을 조회)
  let query1 = `
    SELECT 
    
    \`m\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`parent_user_key\` AS \`parent_user_key\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    \`m\`.\`user_pay_type\` AS \`user_pay_type\`,
    \`m\`.\`user_charge_type\` AS \`user_charge_type\`,
    \`m\`.\`signup_code\` AS \`signup_code\`,
    \`m\`.\`cash\` AS \`cash\`,
    
    \`m\`.\`sms_one_price\` AS \`sms_one_price\`,
    \`m\`.\`lms_one_price\` AS \`lms_one_price\`,
    \`m\`.\`mms_one_price\` AS \`mms_one_price\`,
    \`m\`.\`kakao1_one_price\` AS \`kakao1_one_price\`,
    \`m\`.\`kakao2_one_price\` AS \`kakao2_one_price\`,
    \`m\`.\`munja_send_limit_day\` AS \`munja_send_limit_day\`,
    \`m\`.\`munja_send_limit_month\` AS \`munja_send_limit_month\` 
    
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_id\` = ? 
    AND \`m\`.\`user_status\` = ? 
  `;
  let value_array1 = [
    m_user_id,
    1
  ];
  const check_member_exist_result = connection.query(
    query1,
    value_array1
  )
  
  if (!check_member_exist_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:200261});
    return;
  }
  
  if (check_member_exist_result.length === 0) {
    // 해당 회원 정보가 없으면 막기
    res.json({result:"fail", code:200262});
    return;
  }
  
  if (check_member_exist_result.length !== 1) {
    // 해당 회원 정보가 1개가 아니면 막기
    res.json({result:"fail", code:200263});
    return;
  }
  
  
  const user_info = check_member_exist_result[0];
  
  
  // API는 기업계정만 이용 가능한데, 조회된 회원은 기업 계정이 아닌 경우
  if (user_info.user_type != 2) {
    res.json({result: "fail", code: 200301})
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  if (typeof mt != "string") {
    res.json({result:"fail", code:200331});
  }
  
  
  // mt 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(mt)) {
    res.json({result:"fail", code:200332});
    return;
  }
  
  // mt에 특수문자가 들어가 있으면 막기 (문자 토큰은 문자와 숫자로 이루어져 있기 때문)
  if (check_regular_express(mt, 'special_char')) {
    res.json({result:"fail", code:200333});
    return;
  }
  
  // mt에 길이가 100자가 아니면 막기 (문자 토큰은 100자 이므로)
  if (mt.length !== 100) {
    res.json({result:"fail", code:200334});
    return;
  }
  
  // 해당 user와 해당 munja token 이 그룹 테이블에 존재 하는지 체크
  const check_mt_result = connection.query(`
    SELECT 
    
    \`msgl\`.\`Send_Time\` AS \`Send_Time\` 
    
    FROM \`munjamoa\`.\`munja_send_group_log\` AS \`msgl\` 
    
    WHERE \`msgl\`.\`munja_token\` = ? 
    AND \`msgl\`.\`user_key\` = ? 
  `, [
    mt,
    user_info.user_key
  ]);
  
  if (!check_mt_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:200361});
    return;
  }
  
  if (check_mt_result.length !== 1) {
    // 결과가 없으면 막기
    res.json({result:"fail", code:200362});
    return;
  }
  
  const send_time = check_mt_result[0].Send_Time; // 보낸 날짜
  
  // 보낸 날짜에서 년 월 정보 가져오기
  let send_time_datetime_obj = new Date(send_time);
  let year = send_time_datetime_obj.getFullYear();
  let month = send_time_datetime_obj.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  
  // 조회 로그 테이블 명칭 지정
  const table_name = 'Msg_Log_' + year + month; // ex) Msg_Log_201908
  
  // 해당 로그 테이블에서 해당 문자토큰 값 조회하기
  const mt_status_result = connection.query(`
    SELECT 
    
    \`ml\`.\`Result\` AS \`Result\` 
    
    FROM \`munjamoa\`.\`${table_name}\` AS \`ml\` 
    
    WHERE \`ml\`.\`munja_token\` = ? 
  `, [
    mt
  ]);
  
  if (!mt_status_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:200401});
    return;
  }
  
  if (mt_status_result.length === 0) {
    // 조회된게 없으면 막기
    res.json({result:"fail", code:200402});
    return;
  }
  
  // 조회된게 있으면
  // const result = mt_status_result[0].Result; // 0 ~ 999
  
  
  
  // 성공수, 실패수 반환하기
  let success_count = 0;
  let failure_count = 0;
  for (let i=0; i<mt_status_result.length; i++) {
    if (mt_status_result[i].Result == 0) {
      success_count++;
    } else {
      failure_count++;
    }
  }
  
  
 
  
  // 결과 반환
  
  res.json({
    result:"success", 
    success_count: success_count,
    failure_count: failure_count,
  });
  return;
});


























// API 예약문자 취소 요청
router.post('/:company_initial/reservCancel', function(req, res, next) {
  // if (!allow_ip_address_list.includes(requestIP.getClientIp(req))) {
  //   // 효성 IP 주소가 아니면 막기
  //   res.json({result:"fail", code:100501});
  //   return;  
  // }
  
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn 또는 hyoseong
  
  
  
  // 해당 이니셜이 api키 발급 내역에 존재 하는지 체크
  const check_initial_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`cl\`.\`company_initial\` = ? 
  `, [
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_initial_valid_result.length === 0) {
    // 유효한 업체 이니셜이 아닌 경우
    res.json({result:"fail", code:300101});
    return;
  }
  
  
  
  
  
  
  
  // 필요한 값 받아오기
  const {
    api_key,
    m_user_id, // 문자모아 유저 아이디
    mt // 문자 고유 번호
  } = req.body;
  
  
  
  
  // 값 유효성 검사
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:300131});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:300132});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:300133});
    return;
  }
  
  
  
  // 해당 이니셜과 api키에 매치되는 유효한 api키가 존재하는지 DB에서 체크하기
  const check_access_valid_result = connection.query(`
    SELECT 
    
    \`akl\`.\`seq\` AS \`seq\`,
    \`akl\`.\`api_key\` AS \`api_key\`,
    \`akl\`.\`company_seq\` AS \`company_seq\`,
    
    \`cl\`.\`company_name\` AS \`company_name\`,
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    
    \`akl\`.\`created_at\` AS \`created_at\`,
    \`akl\`.\`allow_ip\` AS \`allow_ip\`,
    \`akl\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`api_key_log\` AS \`akl\` 
    
    LEFT JOIN \`munjamoa\`.\`company_list\` AS \`cl\` 
    ON \`cl\`.\`seq\` = \`akl\`.\`company_seq\` 
    
    WHERE \`akl\`.\`api_key\` = ? 
    AND \`cl\`.\`company_initial\` = ? 
  `, [
    api_key,
    company_initial
  ]);
  
  
  // 결과가 없으면 막기
  if (check_access_valid_result.length !== 1) {
    // 유효한 API키가 아닌 경우
    res.json({result:"fail", code:300161});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:300162});
    return;
  }
  
  let allow_ip = check_access_valid_result[0].allow_ip;
  let allow_ips = allow_ip.split(',');
  
  // 허용 ip 수 만큼 반복문 돌기
  let is_allow_ip_match = false;
  for (let i=0; i<allow_ips.length; i++) {
    let ip = allow_ips[i]; // ex) 154.22.333.25, 180.255.231.0/24
    let ip_split = ip.split('.');
    let check_ip = '';
    
    if (ip.includes('/8')) {
      check_ip = ip_split[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/16')) {
      check_ip = ip_split[0] + '.' + ip_split[1];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/24')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else if (ip.includes('/32')) {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3].split('/')[0];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    } else {
      check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3];
      if (requestIP.getClientIp(req).includes(check_ip)) {
        // 요청 ip가 허용 ip 규칙에 맞으면
        is_allow_ip_match = true;
        break;
      }
    }
  }
  
  // 요청 ip 주소가 허용 ip 주소에 포함되어 있지 않은 경우
  if (!is_allow_ip_match) {
    res.json({result:"fail", code:300201});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  // m_user_id 검사
  if (typeof m_user_id != "string") {
    res.json({result:"fail", code:300231});
    return;
  }
  
  // 해당 user_id 가 우리 문자모아에 존재���는지 체크 (회원 상태가 정상인 것을 조회)
  let query1 = `
    SELECT 
    
    \`m\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`parent_user_key\` AS \`parent_user_key\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    \`m\`.\`user_pay_type\` AS \`user_pay_type\`,
    \`m\`.\`user_charge_type\` AS \`user_charge_type\`,
    \`m\`.\`signup_code\` AS \`signup_code\`,
    \`m\`.\`cash\` AS \`cash\`,
    
    \`m\`.\`sms_one_price\` AS \`sms_one_price\`,
    \`m\`.\`lms_one_price\` AS \`lms_one_price\`,
    \`m\`.\`mms_one_price\` AS \`mms_one_price\`,
    \`m\`.\`kakao1_one_price\` AS \`kakao1_one_price\`,
    \`m\`.\`kakao2_one_price\` AS \`kakao2_one_price\`,
    \`m\`.\`munja_send_limit_day\` AS \`munja_send_limit_day\`,
    \`m\`.\`munja_send_limit_month\` AS \`munja_send_limit_month\` 
    
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_id\` = ? 
    AND \`m\`.\`user_status\` = ? 
  `;
  let value_array1 = [
    m_user_id,
    1
  ];
  const check_member_exist_result = connection.query(
    query1,
    value_array1
  )
  
  if (!check_member_exist_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:300261});
    return;
  }
  
  if (check_member_exist_result.length === 0) {
    // 해당 회원 정보가 없으면 막기
    res.json({result:"fail", code:300262});
    return;
  }
  
  if (check_member_exist_result.length !== 1) {
    // 해당 회원 정보가 1개가 아니면 막기
    res.json({result:"fail", code:300263});
    return;
  }
  
  
  const user_info = check_member_exist_result[0];
  
  
  // API는 기업계정만 이용 가능한데, 조회된 회원은 기업 계정이 아닌 경우
  if (user_info.user_type != 2) {
    res.json({result: "fail", code: 300301})
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (typeof mt != "string") {
    res.json({result:"fail", code:300331});
  }
  
  
  // mt 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(mt)) {
    res.json({result:"fail", code:300332});
    return;
  }
  
  // mt에 특수문자가 들어가 있으면 막기 (문자 토큰은 문자와 숫자로 이루어져 있기 때문)
  if (check_regular_express(mt, 'special_char')) {
    res.json({result:"fail", code:300333});
    return;
  }
  
  // mt에 길이가 100자가 아니면 막기 (문자 토큰은 100자 이므로)
  if (mt.length !== 100) {
    res.json({result:"fail", code:300334});
    return;
  }
  
  
  
  





  // 해당 유형에 해당 문자토큰으로 예약으로 보낸 문자 기록이 있는지 확인
  const check_mt_result = connection.query(`
    SELECT 
    
    \`msgl\`.\`Send_Time\` AS \`Send_Time\`,
    \`msgl\`.\`at_user_pay_type\` AS \`at_user_pay_type\`,
    \`msgl\`.\`at_user_one_price\` AS \`at_user_one_price\`,
    \`msgl\`.\`original_send_count\` AS \`original_send_count\`, 
    \`msgl\`.\`deny_getter_count\` AS \`deny_getter_count\` 
    
    FROM \`munjamoa\`.\`munja_send_group_log\` AS \`msgl\` 
    
    WHERE \`msgl\`.\`munja_token\` = ? 
    AND \`msgl\`.\`user_key\` = ? 
    AND \`msgl\`.\`send_type\` = ? 
    AND \`msgl\`.\`munja_status\` = ? 
  `, [
    mt, // 받아온 문자토큰 값과 일치하고
    user_info.user_key, // 요청온 회원 키와 일치하고
    2, // 보내는 유형이 예약발송이고
    1 // 문자 상태가 정상인 것
  ]);
  
  if (!check_mt_result) {
    // 쿼리 실패시 막기
    res.json({result: "fail", code: 300361});
    return;
  }
  
  if (check_mt_result.length === 0) {
    // 조회된 내역이 없으면 막기
    res.json({result: "fail", code: 300362});
    return;
  }
  
  
  // 현재 날짜에 3분 더한 날짜가 해당 문자 예약 날짜보다 이후이면 막기 
  if (new Date(getCurrentAddMomentDateTime('minute', 3)).getTime() > new Date(check_mt_result[0].Send_Time).getTime()) {
    res.json({result: "fail", code: 300363});
    return;
  }






  
  
  
  const at_user_one_price = check_mt_result[0].at_user_one_price; // 이 문자에 책정된 해당 유저의 건당 요금
  const at_user_pay_type = check_mt_result[0].at_user_pay_type; // 이 문자에 책정된 지불유형 (선불, 후불)
  const original_send_count = check_mt_result[0].original_send_count; // 원래 선택한 수신자 수
  const deny_getter_count = check_mt_result[0].deny_getter_count; // 수신거부자 수
  const will_send_count = original_send_count - deny_getter_count; // 원래 선택한 수신자 수 - 수신거부자 수 (실 보낼 수신자 수)
  
  
  if (isNaN(Number(at_user_one_price))) {
    res.json({result: "fail", code: 300401});
    return;
  }
  
  if (isNaN(Number(original_send_count))) {
    res.json({result: "fail", code: 300402});
    return;
  }
  
  if (isNaN(Number(deny_getter_count))) {
    res.json({result: "fail", code: 300403});
    return;
  }
  
  if (isNaN(Number(will_send_count))) {
    res.json({result: "fail", code: 300404});
    return;
  }

  
  
  // 해당 토큰과 회원키 정보를 가진 예약 문자가 존재할 경우 취소 쿼리 진행하기
  
  // 트랜잭션 시작
  let autocommit_false = connection.query(`
    SET AUTOCOMMIT = FALSE;
  `);
  let transaction_start = connection.query(`
    START TRANSACTION;
  `);
  
  
  try {
    // (1) Msg_Tran 테이블에 있는 예약문자 정보를 Msg_Tran_Delete_Log 테이블로 옮기기
    let move_msg_info_result = connection.query(`
      INSERT INTO \`munjamoa\`.\`Msg_Tran_Delete_Log\` 
      SELECT * FROM \`munjamoa\`.\`Msg_Tran\` AS \`msgtran\`
      WHERE \`msgtran\`.\`munja_token\` = ? 
      AND \`msgtran\`.\`user_key\` = ? 
    `, [
      mt,
      user_info.user_key
    ]);
    
    // (2) Msg_Tran 테이블에 있는 예약문자 정보를 Delete 하기
    let delete_msg_info_result = connection.query(`
      DELETE FROM \`munjamoa\`.\`Msg_Tran\` 
      WHERE \`munja_token\` = ? 
      AND \`user_key\` = ? 
    `, [
      mt,
      user_info.user_key
    ]);
    
    // (3) munja_send_group_log 테이블의 munja_status 값을 2(예약취소 상태)로 바꾸기
    let update_munja_send_group_log_status_result = connection.query(`
      UPDATE \`munjamoa\`.\`munja_send_group_log\` SET 
      \`munja_status\` = ? 
      
      WHERE \`munja_token\` = ? 
      AND \`user_key\` = ? 
    `, [
      2,
      
      mt,
      user_info.user_key
    ]);
    
    
    
    let recovery_cash_result = true;
    let insert_cash_log_result = true;
    
    
    // 선불인 문자였을 경우에만 환불 처리 하기
    if (at_user_pay_type == 1) {
      // (4) 환불처리하기
      let recovery_cash = at_user_one_price * will_send_count; // 환불 해줘야 할 캐쉬 금액
      recovery_cash_result = connection.query(`
        UPDATE \`munjamoa\`.\`member\` SET 
        \`cash\` = \`cash\` + ? 
        
        WHERE \`user_key\` = ? 
      `, [
        recovery_cash,
        
        user_info.user_key
      ]);
      
      // (5) 캐쉬로그남기기
      insert_cash_log_result = connection.query(`
        INSERT INTO \`munjamoa\`.\`member_cash_log\` 
        
        (\`user_key\`, \`plus_or_minus\`, \`cash\`,
         \`log_type\`, \`created_at\`, \`memo\`)VALUES
        
        (?, ?, ?,
         ?, ? ,?)
      `, [
        user_info.user_key, '+', recovery_cash,
        2, getCurrentMomentDatetime(), `(api : ${company_initial}) 고객 요청으로 인한 예약문자 취소로 환불처리, 건당요금 : ${at_user_one_price}, 취소건수 : ${will_send_count}`
      ]);
    }
    
    if (!move_msg_info_result || !delete_msg_info_result || !update_munja_send_group_log_status_result || !recovery_cash_result || !insert_cash_log_result) {
      // 단 하나의 쿼리라도 실패했을 경우 롤백시키고 막기
      let transaction_rollback2 = connection.query(`
        ROLLBACK;
      `);
      
      let autocommit_true = connection.query(`
        SET AUTOCOMMIT = TRUE;
      `);
      
      res.json({result: "fail", code: 300431});
      return;  
    }
    
    
    // 모든 쿼리 성공 했을 경우 COMMIT 후 성공 반환
    let transaction_commit_result = connection.query(`
      COMMIT;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
    
    
    if (at_user_pay_type == 1) {
      res.json({
        result: "success",
        cancel_count: will_send_count,
        refund_cash: at_user_one_price * will_send_count
      });
    } else {
      res.json({
        result: "success",
        cancel_count: will_send_count,
        refund_cash: 0
      });
    }
    
    return;
    
  } catch (e) {
    console.error(e);
    let transaction_rollback2 = connection.query(`
      ROLLBACK;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
    
    res.json({result: "fail", code: 300432});
    return;
  }
});









module.exports = router;
