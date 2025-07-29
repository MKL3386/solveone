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











// POST 요청에 x-www-form-urlencoded 방식으로 요청해야 한다.
router.post('/sendMsg', wrapper(async(req, res, next) => {
  console.log("largeMunjaGuide API 통신");

  console.log('req.headers =>>>>>> ', req.headers);
  console.log('req.body =>>>>>> ', req.body);
  

  

  
  
  // 필요한 값 받아오기
  const {
    api_key, // api 키 ('WXsUVzKzT9dKKC517530741702428FfJU9qf6YUR' 고정)

    large_munja_user_key, // 50통 이상 문자를 발송한 유저의 키. 해당 값으로 Flag 값 update
    
    m_user_id, // 문자모아 유저 아이디 (이 계정 정보로 문자가 발송됨, 고객에게 대량발송 안내문자를 보내고자 하는 문자모아 계정 아이디)

    send_type_guide, // 즉시발송 , 예약발송
    
    phone_no, // 50통 이상 발송하는 주체 

    callback_no, // 발신번호 (문자모아에 등록된 관리자 발신번호 이어야 함)
  } = req.body;
  
  console.log("===============================");
  console.log("===============================");
  console.log("api_key => ",api_key);
  console.log("large_munja_user_key => ",large_munja_user_key);
  console.log("m_user_id => ",m_user_id);
  console.log("send_type_guide => ",send_type_guide);
  console.log("phone_no => ",phone_no); 
  console.log("callback_no => ",callback_no);
  console.log("===============================");
  console.log("===============================");
  
  
  // (1) 값 유효성 검사
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:100161});
    return;
  }
  
  
  if (api_key !== 'WXsUVzKzT9dKKC517530741702428FfJU9qf6YUR') {
    // api_key 값이 고정 key 값이 아닌 경우
    res.json({result:"fail", code:100164});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:100163});
    return;
  }
  
  


  
  // // 허용된 서버 IP
  // const allow_ips = [
  //   '1.220.226.172/32',
  //   '112.175.245.57/32'
  // ];




  
  // // 허용 ip 수 만큼 반복문 돌기
  // let is_allow_ip_match = false;
  // for (let i=0; i<allow_ips.length; i++) {
  //   let ip = allow_ips[i]; // ex) 154.22.333.25, 180.255.231.0/24
  //   let ip_split = ip.split('.');
  //   let check_ip = '';

  //   if (ip == '0.0.0.0') {
  //     is_allow_ip_match = true;
  //     break;
  //   }
    
  //   if (ip.includes('/8')) {
  //     check_ip = ip_split[0];
  //     if (requestIP.getClientIp(req).includes(check_ip)) {
  //       // 요청 ip가 허용 ip 규칙에 맞으면
  //       is_allow_ip_match = true;
  //       break;
  //     }
  //   } else if (ip.includes('/16')) {
  //     check_ip = ip_split[0] + '.' + ip_split[1];
  //     if (requestIP.getClientIp(req).includes(check_ip)) {
  //       // 요청 ip가 허용 ip 규칙에 맞으면
  //       is_allow_ip_match = true;
  //       break;
  //     }
  //   } else if (ip.includes('/24')) {
  //     check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2];
  //     if (requestIP.getClientIp(req).includes(check_ip)) {
  //       // 요청 ip가 허용 ip 규칙에 맞으면
  //       is_allow_ip_match = true;
  //       break;
  //     }
  //   } else if (ip.includes('/32')) {
  //     check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3].split('/')[0];
  //     if (requestIP.getClientIp(req).includes(check_ip)) {
  //       // 요청 ip가 허용 ip 규칙에 맞으면
  //       is_allow_ip_match = true;
  //       break;
  //     }
  //   } else {
  //     check_ip = ip_split[0] + '.' + ip_split[1] + '.' + ip_split[2] + '.' + ip_split[3];
  //     if (requestIP.getClientIp(req).includes(check_ip)) {
  //       // 요청 ip가 허용 ip 규칙에 맞으면
  //       is_allow_ip_match = true;
  //       break;
  //     }
  //   }
  // }
  
  // // 요청 ip 주소가 허용 ip 주소에 포함되어 있지 않은 경우
  // if (!is_allow_ip_match) {
  //   res.json({result:"fail", code:100231});
  //   return;
  // }
  
  
  
  
  







  
  
  // etc 처리
  let etc1_value = "";
  let etc2_value = "";

  
  
  
  






  
  
  
  
  if (typeof m_user_id != "string") {
    res.json({result:"fail", code:100261});
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
  let message;
  

  
  let Msg_Type = 6; // lms
  let munja_type = 2; // lms
  let munja_type_string = 'lms'; // lms

  
  // 문자 내용에 대한 Msg_Type 설정 완료.
  
  
































  

  





  
  
  
  
  
  
  
  
  

  // (3.5) subject 
  let munja_subject = '인터넷 대량문자 발송안내';

  
  
  
  
  
  
  
  
  
  
  
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
  
  
  
  
  














  
  // isMMS 체크
  let mms_file_url = '';

  
  

  
  

















  
  
  
  
  
  
  
  
  
  
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
  
  const spam_check = 'Y';
  let deny_send_flag = 1; // 수신거부자 발송하지 않음
  // if (spam_check == 'N') {
  //   deny_send_flag = 2; // 수신거부자 상관없이 발송함
  // }
  
  
  
  
  
  
  





  
  
  
  
  
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




























  // 즉시발송
  let send_type = 1;
  let real_send_time = getCurrentMomentDatetime();  
  if (send_type_guide == 2) {
    // 예약발송일 경우
    
    // DATE 변수에는 2019-12-25 13:00 이런식으로 년월일 시분 까지만 입력되어야 함. (초 제외)
    
    // if (!is_datetime_string(DATE + ':00')) {
    //   // 예약발송인데 날짜가 날짜형식이 아닌 경우
    //   res.json({result:"fail", code:100501});
    //   return;
    // }
    
    
    // if (!moment(DATE + ':00').isValid()) {
    //   // 예약발송인데 날짜가 유효한 날짜가 아닌 경우
    //   res.json({result:"fail", code:100502});
    //   return;
    // }
    
    
    // if ((new Date(DATE + ':00')).getTime() <= (new Date(getCurrentMomentDatetime())).getTime()) {
    //   // 예약발송인데 날짜가 현재날짜보다 작거나 같은 경우
    //   res.json({result:"fail", code:100503});
    //   return;
    // }
    
    
    // real_send_time = DATE + ':00';
    
    
    // send_type = 2; // 예약발송

      
    message = '[문자마당] 에서 ' + deny_clear_getter_person_list[0].getter_phone + ' 번호로 인터넷 대량 문자(50건 이상)가 발송 예약 처리되었습니다.'
  
  

  } else {
    // 예약발송 아니면 현재날짜로 셋팅

    send_type = 1;
    
    message = '[문자마당] 에서 ' + deny_clear_getter_person_list[0].getter_phone + ' 번호로 ' + moment().format('YYYY-MM-DD') + ' 날짜에 인터넷 대량 문자(50건 이상)가 즉시 발송되었습니다.';
  }












  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
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
  
  






  

  
  
  var reseller_code = "301150232"; // 2023-02-08 문자 발송 시 재판매사 식별코드를 담아서 전송

  
  
















  
  
  // 문자 발송 시작 (트랜잭션 필요)


  console.log("점검");
  console.log("user_key => ",user_key);
  console.log("real_phone => ",deny_clear_getter_person_list);
  console.log("callback_no => ",callback_no);
  console.log("munja_subject => ",munja_subject); 
  console.log("message => ",message);
  console.log("created_at => ",getCurrentMomentDatetime());
  console.log("===============================");
  console.log("===============================");
  
  
  
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
          
          send_munja_query_sms += `
            INSERT INTO \`munjamoa\`.\`Msg_Tran\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Message\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`Reseller_Code\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`)VALUES
            
            (?, ?, ?, 
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?);
          `;
          send_munja_query_sms_values.push(real_phone);
          send_munja_query_sms_values.push(callback_no_line_remove);
          send_munja_query_sms_values.push(real_content);
          
          send_munja_query_sms_values.push(real_send_time);
          send_munja_query_sms_values.push(real_send_time);
          send_munja_query_sms_values.push(Msg_Type);
          send_munja_query_sms_values.push(reseller_code);
          send_munja_query_sms_values.push(getCurrentMomentDatetime());
          
          send_munja_query_sms_values.push(new_munja_token);
          send_munja_query_sms_values.push(user_key);
          send_munja_query_sms_values.push(api_key);
          send_munja_query_sms_values.push(user_signupcode);
          
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
          
          send_munja_query_lms += `
            INSERT INTO \`munjamoa\`.\`Msg_Tran\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`Reseller_Code\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`)VALUES
            
            (?, ?, ?, ?, 
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?);
          `;
          send_munja_query_lms_values.push(real_phone);
          send_munja_query_lms_values.push(callback_no_line_remove);
          send_munja_query_lms_values.push(munja_subject);
          send_munja_query_lms_values.push(real_content);
          
          send_munja_query_lms_values.push(real_send_time);
          send_munja_query_lms_values.push(real_send_time);
          send_munja_query_lms_values.push(Msg_Type);
          send_munja_query_lms_values.push(reseller_code);
          send_munja_query_lms_values.push(getCurrentMomentDatetime());
          
          send_munja_query_lms_values.push(new_munja_token);
          send_munja_query_lms_values.push(user_key);
          send_munja_query_lms_values.push(api_key);
          send_munja_query_lms_values.push(user_signupcode);
        }
          
        send_munja_query_result = connection.query(send_munja_query_lms, send_munja_query_lms_values);
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
        `(api : ${munja_type_string} ${deny_clear_getter_person_list[0].getter_phone} 발신번호 에서 50건 이상 대량문자 발송으로 인한 안내 문자 발송`
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
      user_charge_type, user_key, user_signupcode,
      ''
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
          
          send_munja_list_up_query_sms += `
            INSERT INTO \`munjamoa\`.\`munja_send_group_log_list_up\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Message\`, \`Name\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`)VALUES
            
            (?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?);
          `;
          send_munja_list_up_query_sms_values.push(real_phone);
          send_munja_list_up_query_sms_values.push(callback_no_line_remove);
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
          
          send_munja_list_up_query_lms += `
            INSERT INTO \`munjamoa\`.\`munja_send_group_log_list_up\`
          
            (\`Phone_No\`, \`Callback_No\`, \`Subject\`, \`Message\`, \`Name\`, 
             \`Send_Time\`, \`Save_Time\`, \`Msg_Type\`, \`created_at\`,
             \`munja_token\`, \`user_key\`, \`api_key\`, \`at_signup_code\`)VALUES
            
            (?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?);
          `;
          send_munja_list_up_query_lms_values.push(real_phone);
          send_munja_list_up_query_lms_values.push(callback_no_line_remove);
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
        }
          
        send_munja_list_up_query_result = connection.query(send_munja_list_up_query_lms, send_munja_list_up_query_lms_values);
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









    console.log("여기까지 도달?");

    console.log("여기까지 도달? large_munja_user_key => ",large_munja_user_key);
    console.log("여기까지 도달? phone_no => ",phone_no);




    // 유저 정보에 대량문자 발송 안내 flag 시간 값 입력
    const large_Munja_guide_result = connection.query(`
      UPDATE \`munjamoa\`.\`member_send_number_log\` SET 

      \`large_munja_guide_check\` = ? 
      
      WHERE \`user_key\` = ? 

      AND \`send_number\` = ?
      AND \`status\` = ? 
    `, [
      moment().format('YYYY-MM-DD'),

      large_munja_user_key,
      phone_no,
      1
    ]);


    console.log("여기까지 도달? large_Munja_guide_result => ",large_Munja_guide_result);







    
    
    
    
    
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

    console.log("대량 문자 발송 관련 안내발송 성공");

    return;
    
    
    
  } catch (e) {
    console.log('code : 501700');
    console.log("대량 문자 발송 관련 안내발송 실패");
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



































module.exports = router;
