/* Uploads de arquivos */
var multer  = require('multer');

var storage = multer.diskStorage({
  	destination: function (req, file, cb) {
    	cb(null, 'public/contest/'); // Jogando nesse diretorio
  	},
  	filename: function (req, file, cb) {
		var ext = file.originalname.substr(file.originalname.lastIndexOf('.') + 1); // Pegando extensão do arquivo
    	cb(null, file.fieldname + '-' + Date.now() + '.' + ext); // Renomeando o arquivo para "problem-(data+hora).ext"
  	}
});
var upload = multer({ storage: storage });

var storage_submit = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'public/resolutions/'); // Jogando nesse diretorio
	},
	filename: function (req, file, cb, ext) {
	  var ext = file.originalname.substr(file.originalname.lastIndexOf('.') + 1); // Pegando extensão do arquivo
	  cb(null, file.fieldname + '-' + Date.now() + '.' + ext); // Renomeando o arquivo para "problem-(data+hora).ext"
	}
});
var upload_submit = multer({ storage: storage_submit });

module.exports = function(app){
	var competition = app.controllers.competition; // pega da pasta controllers, o controllers esta setado em load
    
    // Tela com todas as competições
    app.get('/competition', require('connect-ensure-login').ensureLoggedIn(), competition.index); 
    // Criação de competição
	app.get('/competition/create', require('connect-ensure-login').ensureLoggedIn(), competition.create);

	app.get('/competition/room/:id', require('connect-ensure-login').ensureLoggedIn(), competition.room);

	app.get('/competition/room/:id/submit/:id', require('connect-ensure-login').ensureLoggedIn(), competition.submit);

    // Criando sala da competição
	app.post('/create_room', competition.create_room);
	// Upload input e outpus problems
	app.post('/upload_problem', upload.single('arquivo'), competition.upload_problem);
	// Validando a senha para entrar na sala
	app.post('/competition/valida_senha', competition.valida_senha);

	// upload submit code
	app.post('/submit/code', upload_submit.single('problem'), competition.submitProblem);

	// Atualizando data
	app.get('/atualizaData', require('connect-ensure-login').ensureLoggedIn(), competition.atualizaData);
};
