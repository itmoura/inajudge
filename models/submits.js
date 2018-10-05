module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var submits = new Schema({
                id_competidor: String,
                nome_competidor: String,
                id_room: String,
                id_problem: String,
                letra_problem: String,
                data_atual: String,
                hora_atual: String,
                hora_data: String,
                filename: String,
                resposta: String,
                cont_sub: Number
	});

	return mongoose.model('Submits', submits);
};