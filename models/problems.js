module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var problems = new Schema({
        id_competition: String,
		letra: String,
		cor: String,
		nome: String,
		time: String,
		descricao: String,
		txt_entrada: String,
		txt_saida: String,
		exp_entrada: String,
		exp_saida: String,
		arquivo: String
	});

	return mongoose.model('Problems', problems);
};