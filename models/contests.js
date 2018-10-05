module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var contests = new Schema({
		id_autor: String,
		nome_autor: String,
		senha: String,
		titulo: String,
		data_inicio: String,
		data_fim: String,
		descricao: String,
		cont_sub: Number,
		trava_placar: Number,
		competidores: String
	});

	return mongoose.model('Contests', contests);
};
