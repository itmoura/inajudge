var createError = require('http-errors');
var express = require('express');
var load = require('express-load');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Connect
var mongoose = require('mongoose');

var app = express();

// Connect to Database
mongoose.connect('mongodb://onlinejudge:teste123@ds263759.mlab.com:63759/onlinejudgeinatel', function(err){
  if(err) {
    console.log('Erro ao conectar no mongodb: '+err);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname, 'uploads'));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// var fs = require('fs');



module.exports = app;

load('models')
  .then('controllers')
  .then('routes')
  .into(app);

app.listen(4000, function(){
  console.log('Rodando...');
})
