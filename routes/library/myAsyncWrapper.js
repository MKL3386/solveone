const moment = require('moment-timezone');

module.exports = asyncFn => { 
	return (
		async (req, res, next) => { 
			try { 
				return await asyncFn(req, res, next);
			} catch (error) { 
				console.log('에러발생일시 : ' + moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'));
				console.log('[  error  ]');
				console.log(error);

				console.error('에러발생일시 : ' + moment(new Date()).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'));
				return next(error); 
			} 
		}
	); 
};
