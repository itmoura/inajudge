module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var esclarecimentos = new Schema({
        id_competition: String,
		letra: String,
        pergunta: String,
        resposta: String
	});

	return mongoose.model('Esclarecimentos', esclarecimentos);
};