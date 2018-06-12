module.exports = function(){

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var submits = new Schema({
        autor: String,
        id_competition: String,
        id_problem: String,
        data_atual: String,
        hora_atual: String,
        filename: String
	});

	return mongoose.model('Submits', submits);
};