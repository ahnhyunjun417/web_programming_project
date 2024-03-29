var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

require('dotenv').config();

const sequelize = require('./models').sequelize;

// 여기에서 force: true면 db 날라가서 나중에 이거 어느정도 
// 테이블 스키마가 다 완료되면
// force: false로 바꿔줘야 함 안그러면 차곡차곡 모은 데이터가
// 다 날라감!!!!
sequelize.sync({force: false}).then(()=> {
  console.log('database connect');
}).catch((err)=> {
  console.log(err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use("/buy", require('./routes/buy'));
app.use("/sell", require('./routes/sell'));
app.use("/admin", require('./routes/admin'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
