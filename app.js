var createError = require('http-errors');
var express = require('express');
var load = require('express-load');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Connect
var mongoose = require('mongoose');

var multer = require('multer'); //
var session = require('cookie-session'); //
var bCrypt = require('bcrypt-nodejs');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var createHash = function(conteudo){
  return bCrypt.hashSync(conteudo, bCrypt.genSaltSync(10), null);
}

// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = '\d{s8:#@i%rct|y';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

// Connect to Database
mongoose.connect('mongodb://onlinejudge:novaSenha123@ds163382.mlab.com:63382/onlinejudgeinatel', function(err){
  if(err) {
    console.log('Erro ao conectar no mongodb: '+err);
  }
});

passport.use(new Strategy(
  function(username, password, cb) {

   var Usuarios = app.models.users;

    Usuarios.findOne({email: username}, function(err, user){
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (!isValidPassword(user, password)) { return cb(null, false); }

        return cb(null, user);
    });
}));

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.senha);
}

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  var Usuarios = app.models.users;

  Usuarios.findById(id, function(err, user){
    if (err) { return cb(err); }
    cb(null, user);
    return console.log(user);
  });
});

var app = express();

// Use the session middleware
app.use(session({ secret: '#$%¨&*()ko15das', cookie: { maxAge: 60000 }}))  // secret: keyboard cat

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCrossDomain);
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));



// app.use(express.static(__dirname, 'uploads'));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/login',
function(req, res){
  res.render('login');
});

app.get('/signup',
function(req, res){
  res.render('signup');
});

app.post('/login',
passport.authenticate('local', { failureRedirect: '/login' }),
function(req, res) {
  res.redirect('/competition');
  global.id_competidorGlobal = req.user._id;  
});

app.post('/signup', function(req, res) {
  var Usuarios = app.models.users;
	Usuarios.findOne({'email': req.body.email}, function(err, data){
		if(data != null){
			if (data.email == req.body.email)
				res.render('signup', { email_search: 1 });
		} else {
			var model = new Usuarios;
			model.nome = req.body.nome;
			model.email = req.body.email;
			model.senha = createHash(req.body.password);
			model.competicoes = 1;
			model.save(function(err){
				if (err) {
					console.log(err);
				} else {
					res.redirect('/login');
				}
			});
		}
	});
});

app.get('/logout',
function(req, res){
  req.logout();
  res.redirect('/login');
});

app.listen(4000, function(){
  console.log('Rodando...');
})
