module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var submits = new Schema({
        id_competidor: String,
        id_room: String,
        id_problem: String,
        letra_problem: String,
        data_atual: String,
        hora_atual: String,
        filename: String,
        resposta: String
	});

	return mongoose.model('Submits', submits);
};