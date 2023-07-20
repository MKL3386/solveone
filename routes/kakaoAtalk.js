var express = require('express');
var router = express.Router();


// my library
var check_regular_express = require('./library/regular_expression_library').check_regular_express;
var isUndefined = require('./library/isUndefined').isUndefined;
var stringByteCheck = require('./library/stringByteCheck').stringByteCheck;
var getMakeToken = require('./library/getMakeToken').getMakeToken;
var getCurrentMomentDatetime = require('./library/getCurrentMomentDatetime').getCurrentMomentDatetime;
var getCurrentAddMomentDateTime = require('./library/getCurrentAddMomentDateTime').getCurrentAddMomentDateTime;
var is_datetime_string = require('./library/is_datetime_string').is_datetime_string;


// npm
var requestIP = require('request-ip');
var moment = require('moment-timezone');
require('dotenv').config();
var mysql = require('sync-mysql');
var connection = new mysql({
  host: process.env.DATABASE_IP_ADDR, // mysql주소
  port: process.env.DATABASE_PORT, 
  user: process.env.DATABASE_ID,  // 유저 
  password: process.env.DATABASE_PASSWORD, // 비밀번호
  database: process.env.DATABASE // 데이터베이스 이름
});







// var allow_ip_address_list = [
  
// ];







// 카카오 알림톡 발송 요청
// POST 요청에 x-www-form-urlencoded 방식으로 요청해야 한다.
router.post('/:company_initial/sendMsg', function(req, res, next) {
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn
  
  if (typeof company_initial != "string") {
    res.json({result:"fail", code:240101});
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
    res.json({result:"fail", code:240121});
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
    res.json({result:"fail", code:240141});
    return;
  }
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  // 값 받아오기
  let {
    api_key, // api 키
    // signup_code, // 가입코드
    id, // 회원 id
    
    
    etc1, // api 이용 업체가 사용하는 칼럼 값1
    etc2, // api 이용 업체가 사용하는 칼럼 값2
    
    
    BUTTON_FLAG, // 버튼 존재 유무 ('Y', 'N')
    
    // SENDER_KEY, // 발신 프로필 키
    
    SENDER_HOST, // 발송주체 (P: api url에 있는 문자마당 유저, M: 파라미터로 넘긴 id의 유저, 파라미터로 전달한 채널ID와 템플릿ID, 발신번호 존재유무 조회 대상이기도 함)
    
    PLUS_ID,// 플러스친구 검색용아이디
    // TMPL_CD, // 템플릿코드
    TMPL_ID, // 템플릿 ID
    
    CALLBACK, // 발신번호
    PHONE, // 수신번호
    SUBJECT, // MMS 전환시 문자 제목
    MSG, // 메세지 내용
    
    SEND_TYPE, // 즉시발송, 예약발송 여부 (R = 예약발송)
    DATE, // 발송날짜 (기본값 NOW())
    
    TYPE, // (기본 값 5)
    STATUS, // (기본 값 '1')
    REPLACE_TYPE, // 전환발송 여부 (엠티에스 테이블에 넣을 때는 N으로 넣고 다른 필드에 실제 값 넣기, 우리가 CRON으로 읽을 값을 말이지)
    REPLACE_MSG, // 전환전송 대체문구 (최대 2000자)
    BUTTON, // 버튼 (제목, 링크) => 최대 5개까지 가능 (json 형태), BUTTON_FLAG 값이 'Y'일 경우에만 체크
  } = req.body;
  
  
  
  
  
  
  // 값 유효성 체크
  
  // etc 값 체크
  let etc1_value = etc1;
  if (typeof etc1 == "undefined") {
    etc1_value = "";
  }
  
  let etc2_value = etc2;
  if (typeof etc2 == "undefined") {
    etc2_value = "";
  }
  
  const etc_json = `{"etc1":"${etc1_value}", "etc2":"${etc2_value}"}`;
  
  
  
  
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240161});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:240162});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:240163});
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
    res.json({result:"fail", code:240181});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:240182});
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
    res.json({result:"fail", code:240201});
    return;
  }
  
  
  
  
  
  
  
  
  // id 유효성 검사
  if (typeof id != "string") {
    // id 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240221});
    return;
  }
  
  // if (id.length < 6 || id.length > 20) {
  //   // id 값이 6자 미만 20자 초과인 경우
  //   res.json({result:"fail", code:240222});
  //   return;
  // }
  
  // if (!check_regular_express(id, 'english_number')) {
  //   // id이 영문 또는 숫자 조합이 아닌 경우
  //   res.json({result:"fail", code:100173});
  //   return;
  // }
  
  
  
  
  
  
  
  // // signup_code 유효성 검사
  // if (typeof signup_code != "string") {
  //   // signup_code 값이 문자열이 아닌 경우
  //   res.json({result:"fail", code:100151});
  //   return;
  // }
  
  // if (signup_code.length !== 100) {
  //   // signup_code 값이 100자가 아닌 경우
  //   res.json({result:"fail", code:100152});
  //   return;
  // }
  
  // if (check_regular_express(signup_code, 'special_char')) {
  //   // signup_code 값에 특수문자가 포함된 경우
  //   res.json({result:"fail", code:100153});
  //   return;
  // }
  
  
  
  
  
  
  
  
  
  
  // 해당 가입코드와 ID에 매칭되는 회원 정보가 있는지 조회하기 (x)
  // 해당 ID에 매칭되는 회원 정보가 있는지 조회하기 (o)
  const check_member_valid_result = connection.query(`
    SELECT 
    
    \`m\`.\`seq\` AS \`seq\`, 
    \`m\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`user_id\` AS \`user_id\`, 
    \`m\`.\`recent_password_change_at\` AS \`recent_password_change_at\`,
    \`m\`.\`user_name\` AS \`user_name\`,
    \`m\`.\`user_email\` AS \`user_email\`,
    \`m\`.\`user_birthday\` AS \`user_birthday\`,
    \`m\`.\`user_addr_post_number\` AS \`user_addr_post_number\`,
    \`m\`.\`user_addr_basic\` AS \`user_addr_basic\`,
    \`m\`.\`user_addr_detail\` AS \`user_addr_detail\`,
    \`m\`.\`user_tel\` AS \`user_tel\`,
    \`m\`.\`user_phone\` AS \`user_phone\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    \`m\`.\`company_name\` AS \`company_name\`,
    \`m\`.\`company_upload_number\` AS \`company_upload_number\`,
    \`m\`.\`news_mail_get\` AS \`news_mail_get\`,
    \`m\`.\`cash\` AS \`cash\`,
    \`m\`.\`sms_one_price\` AS \`sms_one_price\`,
    \`m\`.\`lms_one_price\` AS \`lms_one_price\`,
    \`m\`.\`mms_one_price\` AS \`mms_one_price\`,
    \`m\`.\`kakao1_one_price\` AS \`kakao1_one_price\`,
    \`m\`.\`kakao2_one_price\` AS \`kakao2_one_price\`,
    \`m\`.\`user_pay_type\` AS \`user_pay_type\`,
    \`m\`.\`user_atalk_pay_type\` AS \`user_atalk_pay_type\`,
    \`m\`.\`user_deferred_payment_fixed_price\` AS \`user_deferred_payment_fixed_price\`,
    \`m\`.\`user_deferred_payment_fixed_num\` AS \`user_deferred_payment_fixed_num\`,
    \`m\`.\`user_charge_type\` AS \`user_charge_type\`,
    \`m\`.\`signup_datetime\` AS \`signup_datetime\`,
    \`m\`.\`user_status\` AS \`user_status\`,
    \`m\`.\`signup_code\` AS \`signup_code\`,
    \`m\`.\`parent_user_key\` AS \`parent_user_key\` 
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_id\` = ? 
  `, [
    id
  ]);
  
  if (check_member_valid_result.length === 0) {
    // 일치하는 회원 정보가 없는 경우
    res.json({result:"fail", code:240241});
    return;
  }
  
  if (check_member_valid_result[0].user_status !== 1) {
    // 조회된 회원상태가 정상상태가 아닌 경우
    res.json({result:"fail", code:240242});
    return;
  }
  
  
  if (check_member_valid_result[0].user_type != 2) {
    // 조회된 회원이 기업 계정이 아닌 경우 
    res.json({result:"fail", code:240243});
    return;
  }
  
  
  
  // 해당 ID와 일치하는 회원 정보가 존재함
  const user_info = check_member_valid_result[0];
  
  
  
  
  
  
  
  
  
  
  // 문자모아에 조회된 회원이 기업 회원이 아닌 경우 막기
  // if (user_info.user_type != 2) {
  //   res.json({result:"fail", code:240261});
  //   return;
  // }
  
  
  
  
  
  
  
  
  
  // PLUS_ID (플러스계정 검색용 아이디) 유효성 검사
  if (typeof PLUS_ID != "string") {
    // PLUS_ID 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240281});
    return;
  }
  
  if (PLUS_ID.length > 100) {
    // PLUS_ID 값이 100자가 넘는 경우
    res.json({result:"fail", code:240282});
    return;
  }
  
  
  
  
  
  
  
  
  /*
    -- 2019-10-31 추가 --
    
    여러명의 문자마당 회원이 하나의 카카오채널 ID 로 알림톡을 보내는 경우도 있을 수 있으므로,
    
    SENDER_HOST 파라미터 값을 통해, 이 알림톡을 보내는 주체가 api url에 있는 id의 유저인지,
    아니면 파라미터로 전달한 id의 유저인지에 대한 유무에 따라 
    카카오 채널 ID와 템플릿 ID의 존재 유무를 검색할 회원을 결정함.
  */
  
  let kakao_sender_info_target_user_key = '';
  // SENDER_HOST = 'M'; // 기본 값으로는 발송 주체는 파라미터 전달한 id
  
  SENDER_HOST = 'M'; // 일단은 무조건 발송주체는 API URL의 업체 계정이 아니라 전달받은 ID로 설정되게 해놓기
  
  if (SENDER_HOST == 'P') {
    kakao_sender_info_target_user_key = best_parent_company_info.user_key;
  } else {
    kakao_sender_info_target_user_key = user_info.user_key;
  }
  
  
  
  
  
  
  
  
  // 받아온 플러스 친구 검색용아이디가 조회된 회원의 플러스 친구 계정 리스트에 있는지 체크
  const user_plus_id_check = connection.query(`
    SELECT 
    
    \`mkpal\`.\`seq\` AS \`seq\`,
    \`mkpal\`.\`user_key\` AS \`user_key\`,
    \`mkpal\`.\`kakao_plus_id\` AS \`kakao_plus_id\`,
    \`mkpal\`.\`phone\` AS \`phone\`,
    \`mkpal\`.\`sender_key\` AS \`sender_key\`,
    \`mkpal\`.\`created_at\` AS \`created_at\`,
    \`mkpal\`.\`judge_status\` AS \`judge_status\`,
    \`mkpal\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`member_kakaoAtalk_plus_accout_log\` AS \`mkpal\`
    
    WHERE \`mkpal\`.\`user_key\` = ? 
    AND \`mkpal\`.\`kakao_plus_id\` = ? 
    AND \`mkpal\`.\`judge_status\` = ? 
    AND \`mkpal\`.\`status\` = ? 
  `, [
    kakao_sender_info_target_user_key,
    PLUS_ID,
    4,
    1
  ]);
  
  
  if (user_plus_id_check.length !== 1) {
    // 회원에 등록된 유효한 플러스친구 아이디가 아닌 경우
    res.json({result:"fail", code:240301});
    return;
  }
  
  
  // 플러스 계정 정보
  const user_plus_account_info = user_plus_id_check[0];
  
  
  
  
  
  
  
  
  
  // TMPL_ID (템플릿 ID) 유효성 검사
  if (typeof TMPL_ID != "string") {
    // TMPL_CD 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240321});
    return;
  }
  
  if (TMPL_ID.length > 100) {
    // TMPL_ID 값이 100자가 넘는 경우
    res.json({result:"fail", code:240322});
    return;
  }
  
  
  
  // 받아온 TMPL_ID 가 플러스 계정에 등록된 유효한 템플릿인지 체크하기
  const plus_account_template_check = connection.query(`
    SELECT 
    
    \`mktl\`.\`seq\` AS \`seq\`,
    \`mktl\`.\`user_key\` AS \`user_key\`,
    \`mktl\`.\`kakao_plus_id\` AS \`kakao_plus_id\`,
    \`mktl\`.\`template_id\` AS \`template_id\`,
    \`mktl\`.\`template_name\` AS \`template_name\`,
    \`mktl\`.\`template_content\` AS \`template_content\`,
    \`mktl\`.\`template_button\` AS \`template_button\`,
    \`mktl\`.\`template_code\` AS \`template_code\`,
    
    \`mktl\`.\`templete_upload_document_path\` AS \`templete_upload_document_path\`,
    \`mktl\`.\`templete_upload_document_file_name\` AS \`templete_upload_document_file_name\`,
    \`mktl\`.\`templete_upoad_document_file_originalname\` AS \`templete_upoad_document_file_originalname\`,

    \`mktl\`.\`companion_because\` AS \`companion_because\`,
    \`mktl\`.\`created_at\` AS \`created_at\`,
    \`mktl\`.\`passed_at\` AS \`passed_at\`,
    \`mktl\`.\`judge_status\` AS \`judge_status\`,
    \`mktl\`.\`status\` AS \`status\` 
    
    FROM \`munjamoa\`.\`member_kakaoAtalk_templateCode_log\` AS \`mktl\` 
    
    WHERE \`mktl\`.\`user_key\` = ? 
    AND \`mktl\`.\`kakao_plus_id\` = ? 
    AND \`mktl\`.\`template_id\` = ? 
    AND \`mktl\`.\`judge_status\` = ? 
    AND \`mktl\`.\`status\` = ? 
  `, [
    kakao_sender_info_target_user_key,
    PLUS_ID,
    TMPL_ID,
    4,
    1,
  ]);
  
  if (plus_account_template_check.length !== 1) {
    // 플러스친구 아이디에 등록된 유효한 템플릿 ID가 아닌 경우
    res.json({result:"fail", code:240341});
    return;
  }
  
  // 템플릿 정보
  const user_template_info = plus_account_template_check[0];
  
  
  // 템플릿의 내용중에 #{} 변수 갯수 파악하기
  const template_content_array = user_template_info.template_content.split('#{');
  
  let template_variable_name_list = [];
  
  if (template_content_array.length == 1) {
    // #{nn} 변수가 존재하지 않는 경우
    
  } else {
    for (let i=0; i<template_content_array.length; i++) {
      if (i == 0) {
        continue;
      }
      
      let items = template_content_array[i].split('}');
      if (items.length != 2) {
        continue;
      }
      
      let variable_name = items[0];
      if (template_variable_name_list.includes(variable_name)) {
        continue;
      }
      template_variable_name_list.push(variable_name); // 이름, 배송날짜, 목적지 ... 등
    }
  }
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  // BUTTON_FLAG (버튼 유무) 유효성 검사
  // if (typeof BUTTON_FLAG != "string") {
  //   // BUTTON_FLAG 값이 문자열이 아닌 경우
  //   res.json({result:"fail", code:100201});
  //   return;
  // }
  
  // if (BUTTON_FLAG != 'Y' && BUTTON_FLAG != 'N') {
  //   // BUTTON_FLAG 값이 'Y'도 아니고 'N'도 아닌 경우
  //   res.json({result:"fail", code:100202});
  //   return;
  // }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // CALLBACK (발신번호) 유효성 검사
  if (typeof CALLBACK != "string") {
    // CALLBACK 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240361});
    return;
  }
  
  if (!check_regular_express(CALLBACK.replace(/-/gi, ""), 'number_only')) {
    // CALLBACK 값에서 - 문자열 제거 한 문자가 숫자만 있는게 아닌 경우
    res.json({result:"fail", code:240362});
    return;
  }
  
  if (CALLBACK.length > 15) {
    // CALLBACK 값이 15자 초과인 경우
    res.json({result:"fail", code:240363});
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
    kakao_sender_info_target_user_key,
    CALLBACK,
    1
  ]);
  
  // 조회된 발신번호가 1개가 아니면 막기
  if (check_callback_no_result.length !== 1) {
    // 문자모아에 사전 등록된 발신번호가 아닌 경우
    res.json({result:"fail", code:240381});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  // PHONE (수신번호) 유효성 검사
  
  if (typeof PHONE != "string") {
    // PHONE 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240401});
    return;
  }
  
  // if (!check_regular_express(PHONE.replace(/-/gi, ''), 'number_only')) {
  //   // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호가 숫자로만 이루어 진 문자가 아닌 경우 막기
  //   res.json({result:"fail", code:100282});
  //   return;
  // }
  
  // if (PHONE.length > 12) {
  //   // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호 길이가 12자보다 크면 막기
  //   res.json({result:"fail", code:100283});
  //   return;
  // }
  
  let all_getter_person_list = [];
  let getter_person_list = [];
  let bad_person_list = [];
  const phone_no_array_2 = PHONE.split(',수신번호'); // ex) [0] => 수신번호|01022224444|이름|홍길동|발송날짜|2019년 09월 23일 오후 3시 30분, [1] => 수신번호|01022224444|이름|소길동|발송날짜|2019년 09월 26일 오후 1시 30분
  const phone_no_array = [];
  
  // console.log("phone_no_array_2 => ",phone_no_array_2);



  for(var x = 0 ; x < phone_no_array_2.length ; x++){
    var phone_item = phone_no_array_2[x];

    if(x > 0){
      phone_item = "수신번호" + phone_item;
    }

    // console.log("phone_item "+ x +". => ",phone_item);
    phone_no_array.push(phone_item);
  }

  console.log("phone_no_array => ",phone_no_array);



  if (phone_no_array.length > 1000) {
    // 수신자 수가 1000명을 넘은 경우
    res.json({result:"fail", code:240421});
    return;
  }
  
  for (let i=0; i<phone_no_array.length; i++) {
    let item = phone_no_array[i]; // ex) 수신번호|01022224444|이름|홍길동|발송날짜|2019년 09월 23일 오후 3시 30분
    let item_split = item.split('수신번호|');
    if (item_split.length != 2) {
      continue;
    }
    
    let item_split2 = item_split[1].split('|');
    let getter_phone = item_split2[0].replace(/-/gi, ''); // ex) 01012341234
    
    
    all_getter_person_list.push({
      getter_phone: getter_phone,
      getter_add_info_text: item
    });
    
    
    if (!check_regular_express(getter_phone, 'number_only')) {
      // 수신번호가 숫자로만 이루어진게 아닌 경우 막기
      bad_person_list.push({
        getter_phone: getter_phone,
        getter_add_info_text: item
      });
      continue;
    }
    
    if (getter_phone.length > 12) {
      // - 표시를 제거한 순수 숫자만 있는 휴대폰 번호 길이가 12자보다 크면 막기
      bad_person_list.push({
        getter_phone: getter_phone,
        getter_add_info_text: item
      });
      continue;
    }
    
    let is_not_exist_variable_name = false;
    for (let k=0; k<template_variable_name_list.length; k++) {
      // 템플릿 내용에 등록된 변수값이 item에 없는 경우
      if (!item.includes(template_variable_name_list[k])) {
        if (!is_not_exist_variable_name) {
          is_not_exist_variable_name = true;
        }
      }
    }
    
    if (is_not_exist_variable_name) {
      // 받아온 정보에 있어야할 템플릿 변수가 없는 경우
      bad_person_list.push({
        getter_phone: getter_phone,
        getter_add_info_text: item
      });
      continue;
    }
    
    
    getter_person_list.push({
      getter_phone: getter_phone,
      getter_add_info_text: item
    });
  }
  
  // 실 수신자 수가 0이면 막기
  if (getter_person_list.length == 0) {
    res.json({result:"fail", code:240441});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // SUBJECT (MMS 전환시 문자 제목) 유효성 검사
  SUBJECT = "";
  // if (typeof SUBJECT != "string") {
  //   // SUBJECT 값이 문자열이 아닌 경우
  //   res.json({result:"fail", code:100301});
  //   return;
  // }
  
  // if (SUBJECT.length > 40) {
  //   // SUBJECT 값이 40자 초과인 경우
  //   res.json({result:"fail", code:100302});
  //   return;
  // }
  
  
  
  
  
  
  
  
  
  
  // MSG (메세지 내용) 유효성 검사
  MSG = user_template_info.template_content;
  if (typeof MSG != "string") {
    // MSG 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240461});
    return;
  }
  
  if (MSG.length > 1000) {
    // MSG 값이 1000자 초과인 경우
    res.json({result:"fail", code:240462});
    return;
  }
  
  if (MSG.trim() == "") {
    // MSG 값이 공백인 경우
    res.json({result:"fail", code:240463});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  if (typeof SEND_TYPE != "string") {
    SEND_TYPE = "";
  }
  
  let send_type = 1; // 즉시발송
  if (SEND_TYPE == 'R') {
    // 예약발송일 경우
    DATE = DATE + ':00';
    
    if (!is_datetime_string(DATE)) {
      // 예약발송인데 날짜가 날짜형식이 아닌 경우
      res.json({result:"fail", code:240481});
      return;
    }
    
    
    if (!moment(DATE).isValid()) {
      // 예약발송인데 날짜가 유효한 날짜가 아닌 경우
      res.json({result:"fail", code:240482});
      return;
    }
    
    
    if ((new Date(DATE)).getTime() <= (new Date(getCurrentMomentDatetime())).getTime()) {
      // 예약발송인데 날짜가 현재날짜보다 작거나 같은 경우
      res.json({result:"fail", code:240483});
      return;
    }
    
    
    send_type = 2; // 예약발송
  } else {
    // 예약발송 아니면 현재날짜로 셋팅
    DATE = getCurrentMomentDatetime();  
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  // TYPE 유효성 검사
  // TYPE 기본값 5 셋팅
  TYPE = 5;
  // 일반 알림톡인지 이미지 알림톡인지 검증 
  if(user_template_info.templete_upload_document_path !== ""){
    TYPE = 51;
  }
  
  
  
  
  
  
  
  
  
  
  
  // STATUS 유효성 검사
  // STATUS 기본값 '1' 셋팅
  STATUS = '1';
  
  
  
  
  
  
  
  
  
  
  
  // REPLACE_TYPE (전환발송 여부) 유효성 검사
  if (typeof REPLACE_TYPE != "string") {
    // REPLACE_TYPE 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240501});
    return;
  }
  
  if (REPLACE_TYPE != 'Y' && REPLACE_TYPE != 'N') {
    // REPLACE_TYPE 값에 지정된 값 이외의 값이 들어있는 경우
    res.json({result:"fail", code:240502});
    return;
  }
  
  
  
  
  
  
  
  
  // REPLACE_TYPE 값이 Y인 경우
  if (REPLACE_TYPE == 'Y') {
    // REPLACE_MSG (전환전송 대체문구) 유효성 검사
    // if (typeof REPLACE_MSG != "string") {
    //   // REPLACE_MSG 값이 문자열이 아닌 경우
    //   res.json({result:"fail", code:100361});
    //   return;
    // }
    
    // if (REPLACE_MSG.length > 2000) {
    //   // REPLACE_MSG 값이 2000자 초과인 경우
    //   res.json({result:"fail", code:100362});
    //   return;
    // }
    
    // if (REPLACE_MSG.trim() == "") {
    //   // REPLACE_MSG 값이 공백인 경우
    //   res.json({result:"fail", code:100363});
    //   return;
    // }
  }
  
  
  
  
  
  
  
  
  
  // BUTTON_FLAG (버튼 유무) 값이 'Y'인 경우
  let BUTTON_JSON = '';
  BUTTON_FLAG = 'N';
  
  // BUTTON 유효성 검사
  BUTTON = user_template_info.template_button;
  
  
  // BUTTON 유효성 검사
  if (typeof BUTTON != "string") {
    // BUTTON 값이 문자열이 아닌 경우
    res.json({result:"fail", code:240521});
    return;
  }
  
  if (BUTTON.trim() == "") {
    // BUTTON 값이 공백인 경우
    res.json({result:"fail", code:240522});
    return;
  }
  
  try {
    BUTTON_JSON = JSON.parse(BUTTON);
  } catch (e) {
    console.error(e);
    // BUTTON 값이 JSON 형태가 아닌 경우
    res.json({result:"fail", code:240541});
    return;
  }
  
  
  
  if (BUTTON_JSON.length > 5) {
    // BUTTON_JSON 길이가 5개 초과인 경우
    res.json({result:"fail", code:240561});
    return;
  }
  
  
  
  if (BUTTON_JSON.length == 0) {
    BUTTON_FLAG = 'N';
  } else if (BUTTON_JSON.length >= 1) {
    BUTTON_FLAG = 'Y';
  }
  
  
  
  // JSON 아이템 마다 반드시 있어야 할 키가 없는 경우
  for (let i=0; i<BUTTON_JSON.length; i++) {
    let item = BUTTON_JSON[i];
    
    // name 키가 없는 경우
    if (item.name == undefined || typeof item.name == "undefined") {
      res.json({result:"fail", code:240581});
      return;
    }
    
    // type 키가 없는 경우
    if (item.type == undefined || typeof item.type == "undefined") {
      res.json({result:"fail", code:240582});
      return;
    }
    
    
    
    // type 값이 지정된 값이 아닌 경우
    let allow_types = [
      "WL", "AL", "DS", "BK", "MD"
    ];
    if (!allow_types.includes(item.type)) {
      res.json({result:"fail", code:240601});
      return;
    }
    
    
    
    if (item.type == "WL") {
      // type이 WL인 경우 아이템에 url_pc 키가 없는 경우
      if (item.url_pc == undefined || typeof item.url_pc == "undefined") {
        res.json({result:"fail", code:240621});
        return;
      }
      
      // type이 WL인 경우 아이템에 url_mobile 키가 없는 경우
      if (item.url_mobile == undefined || typeof item.url_mobile == "undefined") {
        res.json({result:"fail", code:240622});
        return;
      }
    }
    
    if (item.type == "AL") {
      // type이 AL인 경우 아이템에 scheme_ios 키가 없는 경우
      if (item.scheme_ios == undefined || typeof item.scheme_ios == "undefined") {
        res.json({result:"fail", code:240641});
        return;
      }
      
      // type이 AL인 경우 아이템에 scheme_android 키가 없는 경우
      if (item.scheme_android == undefined || typeof item.scheme_android == "undefined") {
        res.json({result:"fail", code:240642});
        return;
      }
    }
  }
  
  
  
  let BUTTON_INSERT_STRING = BUTTON;
  if (BUTTON.length > 2) {
    BUTTON_INSERT_STRING = BUTTON.substr(1, BUTTON.length -2);
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // 조회된 회원정보를 토대로 선불/후불, 결제 과정이 이루어 짐
  

  
  // 조회된 회원의 카카오 알림톡 건당 가격 가져오기
  let kakao1_one_price = user_info.kakao1_one_price; // 알림톡 건당 가격
  if (kakao1_one_price == "" || kakao1_one_price < 6) {
    kakao1_one_price = 7;
  }
  
  
  // 조회된 회원의 현재 결제 유형 가져오기
  const user_atalk_pay_type = user_info.user_atalk_pay_type; // 결제유형 (선불 or 후불)
  
  // 조회된 회원의 현재 캐쉬 값 가져오기
  const user_cash = user_info.cash; // 캐쉬
  
  
  
  
  
  
  
  
  
  
  
  
  /*
    캐쉬 차감 같은 경우는 알림톡 발송 주체가 API URL의 업체이든
    ID의 유저이든 간에 무조건 ID의 유저의 캐쉬가 차감되도록 함.
  */
  
  // 예상 금액
  const will_pay_cash = kakao1_one_price * getter_person_list.length;
  
  
  // 선불인 경우
  if (user_atalk_pay_type == 1) {
    // 현재 캐쉬가 예상 금액보다 작은 경우
    if (user_cash < will_pay_cash) {
      res.json({result:"fail", code:240661});
      return;
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  // 카카오알림톡(문자) 토큰문자열 생성
  const new_munja_token = getMakeToken(100);
  
  
  
  
  
  
  
  
  
  
  // 트랜잭션 시작
  let autocommit_false = connection.query(`
    SET AUTOCOMMIT = FALSE;
  `);
  let transaction_start = connection.query(`
    START TRANSACTION;
  `);
  
  
  
  
  
  
  
  
  
  
  // TRAN_ETC1 칼럼이 실제 우리가 사용할 전환전송 여부 값 파악하는 용도 (우리가 사용하는 문자 모듈로 전환발송하기 위해)
  // TRAN_ETC2 칼럼이 우리쪽에서 구분할 알림톡 고유토큰 키 값으로 사용할 칼럼
  // TRAN_ETC3 칼럼이 at_signup_code (x)
  // TRAN_ETC3 칼럼이 api_url_company_seq 
  // TRAN_ETC4 칼럼이 etc1, etc2 (JSON)
  
  try {
    // (1) 문자 발송 테이블에 INSERT
    let msg_insert_query = '';
    let msg_insert_query_values = [];
    if (BUTTON_FLAG == 'Y') {
      msg_insert_query += `
        INSERT INTO \`munjamoa\`.\`MTS_ATALK_MSG\`
        
        (\`TRAN_SENDER_KEY\`, \`TRAN_TMPL_CD\`, \`TRAN_CALLBACK\`, \`TRAN_PHONE\`,
        \`TRAN_SUBJECT\`, \`TRAN_MSG\`, \`TRAN_DATE\`, \`TRAN_TYPE\`,
        \`TRAN_STATUS\`, \`TRAN_REPLACE_TYPE\`, \`TRAN_REPLACE_MSG\`, \`TRAN_BUTTON\`,
        \`TRAN_ETC1\`, \`TRAN_ETC2\`, \`TRAN_ETC3\`, \`TRAN_ETC4\`)VALUES
      `;
    } else {
      msg_insert_query += `
        INSERT INTO \`munjamoa\`.\`MTS_ATALK_MSG\`
        
        (\`TRAN_SENDER_KEY\`, \`TRAN_TMPL_CD\`, \`TRAN_CALLBACK\`, \`TRAN_PHONE\`,
        \`TRAN_SUBJECT\`, \`TRAN_MSG\`, \`TRAN_DATE\`, \`TRAN_TYPE\`,
        \`TRAN_STATUS\`, \`TRAN_REPLACE_TYPE\`, \`TRAN_REPLACE_MSG\`,
        \`TRAN_ETC1\`, \`TRAN_ETC2\`, \`TRAN_ETC3\`, \`TRAN_ETC4\`)VALUES
      `;
    }
    
    for (let i=0; i<getter_person_list.length; i++) {
      // 이 수신자에 대한 템플릿 변수값을 템플릿 내용에 적용하기
      let variable_apply_msg = MSG;
      for (let k=0; k<template_variable_name_list.length; k++) {
        let target_variable_name = template_variable_name_list[k]; // ex) 배송일자
        let target_variable_name_area = '#{' + template_variable_name_list[k] + '}'; // ex) #{배송일자}
        let add_info_cut = getter_person_list[i].getter_add_info_text.split(target_variable_name + '|');
        let add_info_cut2 = add_info_cut[1].split('|');
        let target_variable_name_of_value = add_info_cut2[0];
        
        let check_msg = MSG;
        let target_split_msg = check_msg.split(target_variable_name_area); // 1개 존재하면 2 length, 2개 존재하면 3 length
        
        for (let j=0; j<target_split_msg.length - 1; j++) {
          variable_apply_msg = variable_apply_msg.replace(target_variable_name_area, target_variable_name_of_value);
        }
      }
      
      
      
      if (REPLACE_TYPE == 'Y') {
        REPLACE_MSG = variable_apply_msg;
      } else {
        REPLACE_MSG = variable_apply_msg;
      }
      
      
      
      
      if (BUTTON_FLAG == 'Y') {
        msg_insert_query += `
          (?, ?, ?, ?,
           ?, ?, ?, ?,
           ?, ?, ?, ?,
           ?, ?, ?, ?)
        `;
        if (i != getter_person_list.length - 1) {
          msg_insert_query += ',';
        }
        msg_insert_query_values.push(user_plus_account_info.sender_key);
        msg_insert_query_values.push(user_template_info.template_code);
        msg_insert_query_values.push(CALLBACK);
        msg_insert_query_values.push(getter_person_list[i].getter_phone);
        
        msg_insert_query_values.push(SUBJECT);
        msg_insert_query_values.push(variable_apply_msg);
        msg_insert_query_values.push(DATE);
        msg_insert_query_values.push(TYPE);
        
        msg_insert_query_values.push(STATUS);
        msg_insert_query_values.push('N');
        msg_insert_query_values.push(REPLACE_MSG);
        msg_insert_query_values.push(BUTTON_INSERT_STRING);
        
        msg_insert_query_values.push(REPLACE_TYPE);
        msg_insert_query_values.push(new_munja_token);
        msg_insert_query_values.push(best_parent_company_info.seq);
        msg_insert_query_values.push(etc_json);
      } else {
        msg_insert_query += `
          (?, ?, ?, ?,
           ?, ?, ?, ?,
           ?, ?, ?,
           ?, ?, ?, ?)
        `;
        if (i != getter_person_list.length - 1) {
          msg_insert_query += ',';
        }
        msg_insert_query_values.push(user_plus_account_info.sender_key);
        msg_insert_query_values.push(user_template_info.template_code);
        msg_insert_query_values.push(CALLBACK);
        msg_insert_query_values.push(getter_person_list[i].getter_phone);
        
        msg_insert_query_values.push(SUBJECT);
        msg_insert_query_values.push(variable_apply_msg);
        msg_insert_query_values.push(DATE);
        msg_insert_query_values.push(TYPE);
        
        msg_insert_query_values.push(STATUS);
        msg_insert_query_values.push('N');
        msg_insert_query_values.push(REPLACE_MSG);
        
        msg_insert_query_values.push(REPLACE_TYPE);
        msg_insert_query_values.push(new_munja_token);
        msg_insert_query_values.push(best_parent_company_info.seq);
        msg_insert_query_values.push(etc_json);
      }
    }
    msg_insert_query += ';';
    
    let send_kakaoAtlak_query_result = connection.query(msg_insert_query, msg_insert_query_values);
    
    
    
    
    // 선불인 경우 캐쉬 관련 작업 하기
    let member_cash_log_insert_result = true;
    let member_cash_change_result = true;
    
    if (user_atalk_pay_type == 1) {
      // 캐쉬 로그 남기기 (2)
      member_cash_log_insert_result = connection.query(`
        INSERT INTO \`munjamoa\`.\`member_cash_log\`
        (\`user_key\`, \`plus_or_minus\`, \`cash\`, \`log_type\`, \`created_at\`, \`memo\`)VALUES
        (?, ?, ?, ?, ?, ?)
      `, [
        user_info.user_key,
        '-',
        will_pay_cash,
        1,
        getCurrentMomentDatetime(),
        `api (${company_initial}) 알림톡 ${getter_person_list.length}건 발송`
      ]);
      
      
      
      
      
      
      
      // 캐쉬 차감하기 (3)
      member_cash_change_result = connection.query(`
        UPDATE \`munjamoa\`.\`member\` SET 
        \`cash\` = \`cash\` - ? 
        
        WHERE \`user_key\` = ? 
        AND \`user_status\` = ? 
      `, [
        will_pay_cash,
        user_info.user_key,
        1
      ]);
      console.log('member_cash_change_result', member_cash_change_result);
    }
    
    
    
    
    
    
    
    // kakaoAtalk_send_group_log 남기기 (4)
    // api url의 주체 업체인 user_key가 at_parent_user_key 값에 들어간다.
    let kakaoAtalk_send_group_log_result = connection.query(`
      INSERT INTO \`munjamoa\`.\`kakaoAtalk_send_group_log\` 
    
      (\`kakaoAtalk_token\`, \`user_key\`, \`at_parent_user_key\`, \`at_user_pay_type\`, \`at_user_atalk_pay_type\`,
       \`at_user_charge_type\`, \`at_user_one_price\`, \`created_at\`, \`send_type\`, \`template_id\`,
       \`TRAN_SENDER_KEY\`, \`TRAN_TMPL_CD\`, \`TRAN_DATE\`, \`TRAN_SUBJECT\`,
       \`TRAN_MSG\`, \`TRAN_CALLBACK\`, \`TRAN_TYPE\`, \`TRAN_STATUS\`,
       \`TRAN_ETC1\`, \`TRAN_REPLACE_MSG\`, \`request_ip\`, \`api_key\`,
       \`TRAN_ETC3\`, \`TRAN_ETC4\`, \`original_send_count\`)VALUES
      
      (?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, 
       ?, ?, ?, ?, 
       ?, ?, ?, ?,
       ?, ?, ?);
    `, [
      new_munja_token, user_info.user_key, best_parent_company_info.user_key, user_info.user_pay_type, user_info.user_atalk_pay_type,
      user_info.user_charge_type, kakao1_one_price, getCurrentMomentDatetime(), send_type, user_template_info.template_id,
      user_plus_account_info.sender_key, user_template_info.template_code, DATE, SUBJECT,
      MSG, CALLBACK, TYPE, STATUS,
      REPLACE_TYPE, REPLACE_MSG, requestIP.getClientIp(req), api_key,
      best_parent_company_info.seq, etc_json, getter_person_list.length
    ]);
    
    
    
    
    
    
    
    if (!send_kakaoAtlak_query_result || !member_cash_log_insert_result || !member_cash_change_result || !kakaoAtalk_send_group_log_result) {
      // 하나라도 쿼리 에러 난거 있으면 ROLLBACK; 하기
      let transaction_rollback2 = connection.query(`
        ROLLBACK;
      `);
      
      let autocommit_true = connection.query(`
        SET AUTOCOMMIT = TRUE;
      `);
      
      res.json({result: "fail", code: 240681});
      return;
    } 
    
    
    
    
    // 모두 정상적으로 진행 되었으면 (문자발송, 캐쉬로그, 캐쉬차감, munja_send_group_log 모두 정상 이면)
    let transaction_commit_result = connection.query(`
      COMMIT;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
        
    
    
    
    
    
    // 해당 user의 현재 잔여 캐쉬 값 가져오기
    let query4 = `
      SELECT 
      
      \`m\`.\`cash\` AS \`cash\` 
      
      FROM \`munjamoa\`.\`member\` AS \`m\` 
      
      WHERE \`m\`.\`user_key\` = ? 
      AND \`m\`.\`user_status\` = ? 
    `;
    let value_array4 = [
      user_info.user_key,
      1
    ];
    const check_member_cash_result = connection.query(
      query4,
      value_array4
    )
    
    if (!check_member_cash_result) {
      // 쿼리 실패시 막기
      res.json({result:"fail", code:240701});
      return;
    }
    
    const current_cash = check_member_cash_result[0].cash;
    
    
    
  

    
    
    
    
    
    
    
    if (user_atalk_pay_type == 2) {
      res.json({
        result: "success", // 결과
        one_price: kakao1_one_price, // 건당 가격
        pay_cash: 0, // 차감된 캐쉬
        current_cash: current_cash, // 현재 남은 캐쉬
        send_count: getter_person_list.length, // 발송된 수
        bad_count: bad_person_list, // 발송안된 수 (잘못된 유형의 데이터 정보)
        mt: new_munja_token // 알림톡 고유 키 값 (추후 이 키를 이용하여 알림톡 발송 성공, 실패 여부 확인 가능)
      });
    } else {
      res.json({
        result: "success", // 결과
        one_price: kakao1_one_price, // 건당 가격
        pay_cash: will_pay_cash, // 차감된 캐쉬
        current_cash: current_cash, // 현재 남은 캐쉬
        send_count: getter_person_list.length, // 발송된 수
        bad_count: bad_person_list, // 발송안된 수 (잘못된 유형의 데이터 정보)
        mt: new_munja_token // 알림톡 고유 키 값 (추후 이 키를 이용하여 알림톡 발송 성공, 실패 여부 확인 가능)
      });
    }
    return;
    
    
    
  } catch (e) {
    console.log('code : 100552');
    console.log('e', e);
    // console.error(e);
    let transaction_rollback2 = connection.query(`
      ROLLBACK;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
    
    res.json({result:"fail", code:240721});
    return;
  }
});




























// 카카오 알림톡 발송 결과 요청
// POST 요청에 x-www-form-urlencoded 방식으로 요청해야 한다.
router.post('/:company_initial/statusMsg', function(req, res, next) {
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn
  
  if (typeof company_initial != "string") {
    res.json({result:"fail", code:270101});
    return;
  }
  
  
  
  // 해당 이니셜이 company_list에 있는지 체크
  const check_initial_exist = connection.query(`
    SELECT 
    
    \`cl\`.\`seq\` AS \`seq\`,
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    \`cl\`.\`company_name\` AS \`company_name\` 
    
    FROM \`munjamoa\`.\`company_list\` AS \`cl\` 
    
    WHERE \`cl\`.\`company_initial\` = ? 
    AND \`cl\`.\`status\` = ? 
  `, [
    company_initial,
    1
  ]);
  
  
  // 해당 이니셜이 company_list에 존재하지 않는 경우
  if (check_initial_exist.length !== 1) {
    res.json({result:"fail", code:270121});
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
    res.json({result:"fail", code:270141});
    return;
  }
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  // 값 받아오기
  let {
    api_key,
    mt // 카카오 알림톡 문자 고유 번호
  } = req.body;
  
  
  
  

  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:270161});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:270162});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:270163});
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
    res.json({result:"fail", code:270181});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:270182});
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
    res.json({result:"fail", code:270201});
    return;
  }









  if (typeof mt != "string") {
    res.json({result:"fail", code:270221});
  }
  
  
  // mt 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(mt)) {
    res.json({result:"fail", code:270241});
    return;
  }
  
  // mt에 특수문자가 들어가 있으면 막기 (문자 토큰은 문자와 숫자로 이루어져 있기 때문)
  if (check_regular_express(mt, 'special_char')) {
    res.json({result:"fail", code:270242});
    return;
  }
  
  // mt에 길이가 100자가 아니면 막기 (문자 토큰은 100자 이므로)
  if (mt.length !== 100) {
    res.json({result:"fail", code:270243});
    return;
  }
  
  // 해당 munja token 이 그룹 테이블에 존재 하는지 체크
  const check_mt_result = connection.query(`
    SELECT 
    
    \`ksgl\`.\`TRAN_DATE\` AS \`TRAN_DATE\` 
    
    FROM \`munjamoa\`.\`kakaoAtalk_send_group_log\` AS \`ksgl\` 
    
    WHERE \`ksgl\`.\`kakaoAtalk_token\` = ? 
  `, [
    mt
  ]);
  
  if (!check_mt_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:270261});
    return;
  }
  
  if (check_mt_result.length !== 1) {
    // 결과가 없으면 막기
    res.json({result:"fail", code:270262});
    return;
  }
  
  const tran_date = check_mt_result[0].TRAN_DATE; // 보낸 날짜
  
  // 보낸 날짜에서 년 월 정보 가져오기
  let send_time_datetime_obj = new Date(tran_date);
  let year = send_time_datetime_obj.getFullYear();
  let month = send_time_datetime_obj.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  
  // 조회 로그 테이블 명칭 지정
  let table_name = 'MTS_ATALK_MSG_LOG_' + year + month; // ex) MTS_ATALK_MSG_LOG_201908
  table_name = 'MTS_ATALK_MSG_LOG';
  
  // 해당 로그 테이블에서 해당 문자토큰 값 조회하기
  const mt_status_result = connection.query(`
    SELECT 
    
    \`maml\`.\`TRAN_RSLT\` AS \`TRAN_RSLT\` 
    
    FROM \`munjamoa\`.\`${table_name}\` AS \`maml\` 
    
    WHERE \`maml\`.\`TRAN_ETC2\` = ? 
  `, [
    mt
  ]);
  
  if (!mt_status_result) {
    // 쿼리 실패시 막기
    res.json({result:"fail", code:270281});
    return;
  }
  
  if (mt_status_result.length === 0) {
    // 조회된게 없으면 막기
    res.json({result:"fail", code:270282});
    return;
  }
  
  // 조회된게 있으면
  // const result = mt_status_result[0].Result; // 0 ~ 999
  
  
  
  // 성공수, 실패수 반환하기
  let success_count = 0;
  let failure_count = 0;
  for (let i=0; i<mt_status_result.length; i++) {
    if (mt_status_result[i].TRAN_RSLT == '1000') {
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


























// API 예약 알림톡 취소 요청
router.post('/:company_initial/reservCancel', function(req, res, next) {
  // if (!allow_ip_address_list.includes(requestIP.getClientIp(req))) {
  //   // 효성 IP 주소가 아니면 막기
  //   res.json({result:"fail", code:100501});
  //   return;  
  // }
  
  // url에 있는 회사 이니셜 값 받아오기
  const company_initial = req.params.company_initial; // ex) newturn 또는 hyoseong
  if (typeof company_initial != "string") {
    res.json({result:"fail", code:290101});
    return;
  }
  
  
  
  
  
  
  // 해당 이니셜이 company_list에 있는지 체크
  const check_initial_exist = connection.query(`
    SELECT 
    
    \`cl\`.\`seq\` AS \`seq\`,
    \`cl\`.\`company_initial\` AS \`company_initial\`,
    \`cl\`.\`company_name\` AS \`company_name\` 
    
    FROM \`munjamoa\`.\`company_list\` AS \`cl\` 
    
    WHERE \`cl\`.\`company_initial\` = ? 
    AND \`cl\`.\`status\` = ? 
  `, [
    company_initial,
    1
  ]);
  
  
  // 해당 이니셜이 company_list에 존재하지 않는 경우
  if (check_initial_exist.length !== 1) {
    res.json({result:"fail", code:290111});
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
    res.json({result:"fail", code:290121});
    return;
  }
  
  
  
  
  
  
  
  // 필요한 값 받아오기
  const {
    api_key,
    id, // 문자모아 유저 아이디
    mt // 알림톡 문자 고유 번호
  } = req.body;
  
  
  
  
  // 값 유효성 검사
  
  // api_key 유효성 검사
  if (typeof api_key != "string") {
    // api_key 값이 문자열이 아닌 경우
    res.json({result:"fail", code:290141});
    return;
  }
  
  
  if (api_key.length !== 100) {
    // api_key 값이 100자가 아닌 경우
    res.json({result:"fail", code:290142});
    return;
  }
  
  if (check_regular_express(api_key, 'special_char')) {
    // api_key 값에 특수문자가 포함된 경우
    res.json({result:"fail", code:290143});
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
    res.json({result:"fail", code:290161});
    return;
  }
  
  if (check_access_valid_result[0].status != 1) {
    // 결과는 있으나 status 값이 1이 아닌 경우
    res.json({result:"fail", code:290162});
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
    res.json({result:"fail", code:290181});
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  // id 검사
  if (typeof id != "string") {
    res.json({result:"fail", code:290201});
    return;
  }
  
  // 해당 user_id 가 우리 문자모아에 존재하는지 체크 (회원 상태가 정상인 것을 조회)
  const check_member_valid_result = connection.query(`
    SELECT 
    
    \`m\`.\`seq\` AS \`seq\`, 
    \`m\`.\`user_key\` AS \`user_key\`,
    \`m\`.\`user_id\` AS \`user_id\`, 
    \`m\`.\`recent_password_change_at\` AS \`recent_password_change_at\`,
    \`m\`.\`user_name\` AS \`user_name\`,
    \`m\`.\`user_email\` AS \`user_email\`,
    \`m\`.\`user_birthday\` AS \`user_birthday\`,
    \`m\`.\`user_addr_post_number\` AS \`user_addr_post_number\`,
    \`m\`.\`user_addr_basic\` AS \`user_addr_basic\`,
    \`m\`.\`user_addr_detail\` AS \`user_addr_detail\`,
    \`m\`.\`user_tel\` AS \`user_tel\`,
    \`m\`.\`user_phone\` AS \`user_phone\`,
    \`m\`.\`user_type\` AS \`user_type\`,
    \`m\`.\`company_name\` AS \`company_name\`,
    \`m\`.\`company_upload_number\` AS \`company_upload_number\`,
    \`m\`.\`news_mail_get\` AS \`news_mail_get\`,
    \`m\`.\`cash\` AS \`cash\`,
    \`m\`.\`sms_one_price\` AS \`sms_one_price\`,
    \`m\`.\`lms_one_price\` AS \`lms_one_price\`,
    \`m\`.\`mms_one_price\` AS \`mms_one_price\`,
    \`m\`.\`kakao1_one_price\` AS \`kakao1_one_price\`,
    \`m\`.\`kakao2_one_price\` AS \`kakao2_one_price\`,
    \`m\`.\`user_pay_type\` AS \`user_pay_type\`,
    \`m\`.\`user_atalk_pay_type\` AS \`user_atalk_pay_type\`,
    \`m\`.\`user_deferred_payment_fixed_price\` AS \`user_deferred_payment_fixed_price\`,
    \`m\`.\`user_deferred_payment_fixed_num\` AS \`user_deferred_payment_fixed_num\`,
    \`m\`.\`user_charge_type\` AS \`user_charge_type\`,
    \`m\`.\`signup_datetime\` AS \`signup_datetime\`,
    \`m\`.\`user_status\` AS \`user_status\`,
    \`m\`.\`signup_code\` AS \`signup_code\`,
    \`m\`.\`parent_user_key\` AS \`parent_user_key\` 
    
    FROM \`munjamoa\`.\`member\` AS \`m\` 
    
    WHERE \`m\`.\`user_id\` = ? 
  `, [
    id
  ]);
  
  if (check_member_valid_result.length === 0) {
    // 일치하는 회원 정보가 없는 경우
    res.json({result:"fail", code:290211});
    return;
  }
  
  if (check_member_valid_result[0].user_status !== 1) {
    // 조회된 회원상태가 정상상태가 아닌 경우
    res.json({result:"fail", code:290212});
    return;
  }
  
  
  if (check_member_valid_result[0].user_type != 2) {
    // 조회된 회원이 기업 계정이 아닌 경우 
    res.json({result:"fail", code:290213});
    return;
  }
  
  
  const user_info = check_member_valid_result[0];
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (typeof mt != "string") {
    res.json({result:"fail", code:290241});
  }
  
  
  // mt 값이 정의 되지 않았거나 빈 값인 경우 막기
  if (isUndefined(mt)) {
    res.json({result:"fail", code:290242});
    return;
  }
  
  // mt에 특수문자가 들어가 있으면 막기 (문자 토큰은 문자와 숫자로 이루어져 있기 때문)
  if (check_regular_express(mt, 'special_char')) {
    res.json({result:"fail", code:290243});
    return;
  }
  
  // mt에 길이가 100자가 아니면 막기 (문자 토큰은 100자 이므로)
  if (mt.length !== 100) {
    res.json({result:"fail", code:290244});
    return;
  }
  
  
  
  





  // 해당 유형에 해당 알림톡토큰으로 예약으로 보낸 알림톡 기록이 있는지 확인
  const check_mt_result = connection.query(`
    SELECT 
    
    \`ksgl\`.\`TRAN_DATE\` AS \`TRAN_DATE\`,
    \`ksgl\`.\`at_user_pay_type\` AS \`at_user_pay_type\`,
    \`ksgl\`.\`at_user_atalk_pay_type\` AS \`at_user_atalk_pay_type\`,
    \`ksgl\`.\`at_user_one_price\` AS \`at_user_one_price\`,
    \`ksgl\`.\`original_send_count\` AS \`original_send_count\` 
    
    FROM \`munjamoa\`.\`kakaoAtalk_send_group_log\` AS \`ksgl\` 
    
    WHERE \`ksgl\`.\`kakaoAtalk_token\` = ? 
    AND \`ksgl\`.\`user_key\` = ? 
    AND \`ksgl\`.\`send_type\` = ? 
    AND \`ksgl\`.\`kakaoAtalk_status\` = ? 
  `, [
    mt, // 받아온 알림톡토큰 값과 일치하고
    user_info.user_key, // 요청온 회원 키와 일치하고
    2, // 보내는 유형이 예약발송이고
    1 // 알림톡 상태가 정상인 것
  ]);
  
  if (!check_mt_result) {
    // 쿼리 실패시 막기
    res.json({result: "fail", code: 290261});
    return;
  }
  
  if (check_mt_result.length === 0) {
    // 조회된 내역이 없으면 막기
    res.json({result: "fail", code: 290262});
    return;
  }
  
  
  // 현재 날짜에 3분 더한 날짜가 해당 문자 예약 날짜보다 이후날짜이면 막기 
  if (new Date(getCurrentAddMomentDateTime('minute', 3)).getTime() > new Date(check_mt_result[0].Send_Time).getTime()) {
    res.json({result: "fail", code: 290263});
    return;
  }






  
  
  
  const at_user_one_price = check_mt_result[0].at_user_one_price; // 이 문자에 책정된 해당 유저의 건당 요금
  const at_user_pay_type = check_mt_result[0].at_user_pay_type; // 이 문자에 책정된 지불유형 (선불, 후불)
  const at_user_atalk_pay_type = check_mt_result[0].at_user_atalk_pay_type; // 이 문자가 보내질 때의 회원의 알림톡 지불유형 (선불, 후불)
  const original_send_count = check_mt_result[0].original_send_count; // 실 수신자 수
  
  
  if (isNaN(Number(at_user_one_price))) {
    res.json({result: "fail", code: 290281});
    return;
  }
  
  if (isNaN(Number(original_send_count))) {
    res.json({result: "fail", code: 290282});
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
    // (1) MTS_ATALK_MSG 테이블에 있는 예약 알림톡 정보를 MTS_ATALK_MSG_Delete_Log 테이블로 옮기기
    let move_msg_info_result = connection.query(`
      INSERT INTO \`munjamoa\`.\`MTS_ATALK_MSG_Delete_Log\` 
      SELECT * FROM \`munjamoa\`.\`MTS_ATALK_MSG\` AS \`mam\` 
      # LEFT JOIN \`munjamoa\`.\`kakaoAtalk_send_group_log\` AS \`ksgl\` 
      # ON \`ksgl\`.\`kakaoAtalk_token\` = \`mam\`.\`TRAN_ETC2\` 
      WHERE \`mam\`.\`TRAN_ETC2\` = ? 
      # AND \`ksgl\`.\`user_key\` = ? 
    `, [
      mt,
      // user_info.user_key
    ]);
    
    // (2) Msg_Tran 테이블에 있는 예약문자 정보를 Delete 하기
    let delete_msg_info_result = connection.query(`
      DELETE FROM \`munjamoa\`.\`MTS_ATALK_MSG\` 
      WHERE \`TRAN_ETC2\` = ? 
      # AND \`user_key\` = ? 
    `, [
      mt,
      // user_info.user_key
    ]);
    
    // (3) kakaoAtalk_send_group_log 테이블의 kakaoAtalk_status 값을 2(예약취소 상태)로 바꾸기
    let update_munja_send_group_log_status_result = connection.query(`
      UPDATE \`munjamoa\`.\`kakaoAtalk_send_group_log\` SET 
      \`kakaoAtalk_status\` = ? 
      
      WHERE \`kakaoAtalk_token\` = ? 
      # AND \`user_key\` = ? 
    `, [
      2,
      
      mt
      // user_info.user_key
    ]);
    
    
    
    let recovery_cash_result = true;
    let insert_cash_log_result = true;
    
    
    // 선불인 문자였을 경우에만 환불 처리 하기
    if (at_user_atalk_pay_type == 1) {
      // (4) 환불처리하기
      let recovery_cash = at_user_one_price * original_send_count; // 환불 해줘야 할 캐쉬 금액
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
        2, getCurrentMomentDatetime(), `(api : ${company_initial}) 고객 요청으로 인한 예약알림톡 취소로 환불처리, 건당요금 : ${at_user_one_price}, 취소건수 : ${original_send_count}`
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
      
      res.json({result: "fail", code: 290301});
      return;  
    }
    
    
    // 모든 쿼리 성공 했을 경우 COMMIT 후 성공 반환
    let transaction_commit_result = connection.query(`
      COMMIT;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
    
    res.json({
      result: "success",
      cancel_count: original_send_count,
      refund_cash: at_user_one_price * original_send_count
    });
    
  } catch (e) {
    console.error(e);
    let transaction_rollback2 = connection.query(`
      ROLLBACK;
    `);
    
    let autocommit_true = connection.query(`
      SET AUTOCOMMIT = TRUE;
    `);
    
    res.json({result: "fail", code: 290321});
    return;
  }
});
































module.exports = router;
