module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var usuarios = new Schema({
		nome: String,
		email: String,
		senha: String,
		competicoes: String
	});

	return mongoose.model('Usuarios', usuarios);
};