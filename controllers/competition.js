var fs = require('fs');
var unzip = require('unzip');
var moment = require('moment');
var S = require('string');


module.exports = function(app) {

	var Contest = app.models.contests;
	var Problem = app.models.problems;
	var Submit = app.models.submits;	
	var Users = app.models.users;	
	moment.locale('pt-BR');
	
 	var CompetitionController = {
		index: function(req,res) {
			Contest.find().sort( {'_id': -1} ).exec(function(err, data){
				if (err) {
					console.log('Erro na busca de todas as competicoes: '+err);
				}
				var data_atual = moment().format();
				var hora_atual = moment().format('LT'); 
				res.render('competition/index', { title: 'Veja todas as competições', listContests: data, moment: moment, data_atual: data_atual, hora_atual: hora_atual  });
			});
			// global.id = req.user._id;
		},
		valida_senha: function(req,res){
			var senha = req.body.senha;
			var _id = req.body._id;
			Contest.findOne({ _id: _id }, function(err, data){
				if (err) {
					console.log('Erro na procura da competicao (entrada da sala): '+err);
				}
				if(data.senha == senha){
					// res.redirect('/competition/room/'+data._id);
					res.sendStatus(200).send();
				}
				else {
					res.sendStatus(403).end();
				}
			});
		},
		room: function(req,res) {
			Contest.findById(req.params.id, function(err, data){
				if (err) {
					console.log('Deu erro em room'+err);
				} 
				else {
					Problem.find({'id_competition': data._id}, function(err, data2){
						if (err) {
							console.log('Deu erro em room'+err);
						}
						
						Submit.find({'id_competidor': req.user._id, 'id_room': data._id}).sort( {'_id': -1} ).exec(function(err, dataSubmit){
							if (err) {
								console.log('Deu erro em room'+err);
							} 
							
							Submit.aggregate([
								{ $group : 
									{ 
										_id : "$id_problem", 
										resposta: { 
											$push: "$resposta"
										}, 
										id_competidor: {
											$push: "$id_competidor"
										},
										id_room: {
											$push: "$id_room"
										},
										id_problem: {
											$push: "$id_problem"
										},
										filename: {
											$push: "$filename"
										},
										hora_atual: {
											$push: "$hora_atual"
										},
										data_atual: {
											$push: "$data_atual"
										},
										letra_problem: {
											$push: "$letra_problem"
										},
										count: { 
											$sum: 1 
										}
									}
								}
							  ]).exec(function(err, submitProblem){
								if (err) {
									console.log('Deu erro em room'+err);
								}
								if (submitProblem == null) {
									submitProblem = 0;
								}
								Submit.aggregate([
									{ $group : 
										{ 
											_id : "$id_competidor",
											resposta: { 
												$push: "$resposta"												
											}, 
											id_competidor: {
												$push: "$id_competidor"
											},
											nome_competidor: {
												$push: "$nome_competidor"
											},
											id_room: {
												$push: "$id_room"
											},
											id_problem: {
												$push: "$id_problem"
											},
											filename: {
												$push: "$filename"
											},
											hora_atual: {
												$push: "$hora_atual"
											},
											data_atual: {
												$push: "$data_atual"
											},
											hora_data: {
												$push: "$hora_data"
											},
											letra_problem: {
												$push: "$letra_problem"
											},
											count: { 
												$sum: 1 
											}
										}
									}
									// { $sort : { count : -1 } }
									// { $sort : { "letra_problem" : 1 } }
								  ]).exec(function(err, rank){
									if (err) {
										console.log('Deu erro em room'+err);
									}
									res.render('competition/room', {
										title: data.titulo, listaCompetiton: data, 
										listProblems: data2, listaSubmit: dataSubmit, 
										submitProblem: submitProblem, string: S, 
										rank: rank, user: req.user, moment: moment});
								});
							});
						});
					});
				}
					
			});			
		},
		atualizaData: function(req,res,callback){
			var data_atual = moment().format('LTS');
			res.render('competition/room', { data_atual: data_atual});
		},
		submit: function(req,res) {
			Problem.findById(req.params.id, function(err, data){
				if (err) {
					console.log('Deu erro em room'+err);
				} 
				else {
					res.render('competition/submit', {title: data.nome, problema: data});
				}
			});			
	  	},
		create: function(req,res) {
	  		res.render('competition/create', { title: 'Crie sua competição' });
		},
		submitProblem: function(req, res, next){
			var filename = req.file.filename;
			var id_room = req.body.id_room;
			var id_problem = req.body.id_problem;
			var id_competidor = req.user._id;
			var nome_competidor = req.user.nome;			
			var model = new Submit;
			model.id_competidor = id_competidor;
			model.nome_competidor = nome_competidor;
			model.id_room = id_room;
			model.id_problem = id_problem;
			model.data_atual = moment().format('DD/MM/YYYY');
			model.hora_atual = moment().format('LT'); 
			model.hora_data = moment().format();
			model.filename = filename;
			Problem.findOne({ _id: id_problem }, function(err, getLetra){
				if (err) {
					console.log('Deu erro em room'+err);
				}
				console.log(getLetra.letra);
				model.letra_problem = getLetra.letra;
				model.save(function(err){
					if (err) {
						console.log(err);
						res.write('<script>alert("Falha ao enviar!"); window.location="../"</script>');
					}
					else {
						// Problem.findOne().sort({'_id': -1}).exec(function(err, data){
						// 	if (err) {
						// 		console.log('Deu erro em room '+err);
						// 	} 
						// 	else {
						model.resposta = Math.floor(Math.random() * (1 - 0 + 1) + 0);
						model.save(function(err){
							if (err) {
								console.log(err);
								res.write('<script>alert("Falha ao enviar!"); window.location="../"</script>');
							} else {
								res.redirect('http://localhost:4000/competition/room/'+id_room);
							}
						});
						// 	}
						// });	
					}
				});
	  		});
		},
		create_room: function(req, res){
			var model = new Contest;
			model.id_autor = req.user._id;
			model.nome_autor = req.user.nome;
			model.senha = req.body.senha;
			model.data_inicio = req.body.data_inicio;
			model.data_fim = req.body.data_fim;
			model.titulo = req.body.title;
			model.descricao = req.body.description;
			model.liberado = false;
			model.save(function(err){
				if (err) {
					console.log(err);
					res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
				}				
				Contest.findOne().sort({'_id': -1}).exec(function(err, data){
					res.redirect('/competition/room/'+data._id);
				});
	  		});
		},
		editar_room: function(req,res){
			Contest.findById(req.body.id_competition, function(err, data){
				if (err) {
					console.log(err);
				} else {
					var model = data;
					var id_sala = req.body.id_competition;
					model.senha = req.body.senha;
					model.data_inicio = req.body.data_inicio;
					model.data_fim = req.body.data_fim;
					model.titulo = req.body.titulo;
					model.descricao = req.body.descricao;
					model.save(function(err){
						if (err) {
							console.log(err);
						} else{
							res.redirect('/competition/room/'+id_sala);
						}
					});
				}
			});
		},
		deletar_room: function(req,res){
			Contest.remove({_id: req.params.id}, function(err){
				if (err) {
					console.log(err);
				} else {
					Problem.remove({'id_competition': req.params.id}, function(err){
						if(err){
							console.log(err);
						} else {
							Submit.remove({'id_room': req.params.id}, function(err){
								if(err){
									console.log(err);
								} else {
									res.redirect('/competition');
								}
							});
						}
					});
				}
			});
		},
		deletar_problema: function(req,res){
			Problem.remove({_id: req.params.id}, function(err){
				if(err){
					console.log(err);
				} else {
					Submit.remove({'id_problema': req.params.id}, function(err){
						if(err){
							console.log(err);
						} else {
							res.redirect('/competition');
						}
					});
				}
			});
		},
		atualizar_competicao: function(req,res){
			Contest.findById(req.params.id, function(err, data){
				if (err) {
					console.log(err);
				} else {
					console.log(data);			
					var model = data;
					var id_sala = data._id;
					// if(data.liberado == null){
					// 	model.liberado = true;
					// 	model.data_inicio = 
					// }
					if(data.liberado == false)
						model.liberado = true;
					else {
						model.liberado = false;
					}
					model.save(function(err){
						if (err) {
							console.log(err);
						} else{
							res.redirect('/competition/room/'+id_sala);
						}
					});
				}
			});
		},
		upload_problem: function(req, res, next){
			var model = new Problem;
			model.id_competition = req.body.id_competition;
			model.letra = req.body.letra;
			model.nome = req.body.nome;
			model.time = req.body.limit_time;
			model.titulo = req.body.title;
			model.descricao = req.body.description;
			model.txt_entrada = req.body.txt_entrada;
			model.txt_saida = req.body.txt_saida;
			model.exp_entrada = req.body.exp_entrada;
			model.exp_saida = req.body.exp_saida;
			model.filename = req.file.arquivo;
			model.save(function(err){
				if (err) {
					console.log(err);
					res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
				}				
				Problem.findOne().sort({'_id': -1}).exec(function(err, data){
					//-fs.createReadStream('./public/contest/'+req.file.filename).pipe(unzip.Extract({ path: './public/contest/'+data.id_competition+'/'+data._id}));
					res.redirect('/competition/room/'+data.id_competition);
				});
	  		});
		}
 	}
  	return CompetitionController;
}


/* 


upload: function(req, res, next){
	var model = new Contest;
	model.autor = "@itmoura";
	model.senha = req.body.senha;
	model.data_inicio = req.body.data_inicio;
	model.data_fim = req.body.data_fim;
	model.titulo = req.body.title;
	model.descricao = req.body.description;
	model.filename = req.file.filename;
	model.save(function(err){
		if (err) {
			console.log(err);
			res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
		}				
		Contest.findOne().sort({'_id': -1}).exec(function(err, data){
			function unzip_problem(){
				fs.createReadStream('./public/contest/'+req.file.filename).pipe(unzip.Extract({ path: './public/contest/'+data._id}));
			}
			if (err) {
				console.log('Deu erro aqui'+err);
			}					
			var nome_problemas = req.body.nome_problemas;
			var nome_final = S(nome_problemas).splitLeft(';');					
			var numero = req.body.numero_problemas;
			var id_competition = data._id;
			var feito = 0;
			
			for(var x = 0; x < numero; x++){
				var model2 = new Problem;
				model2.id_competition = id_competition;
				model2.numero_problemas = req.body.numero_problemas;
				model2.nome_problemas = nome_final[x];
				model2.save(function(err2){
					if (err2) {
						console.log(err2);
						res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
					}
				});
				function cad_problems(){
					fs.readFile('./public/contest/'+id_competition+'/in_'+nome_final[x]+'.txt', 'utf-8', function (err, data2) {						
						if(err)
							console.log(err);
						else {
							var n = 0;
							var teste = S(data2).splitLeft(';');
							console.log(teste.length);
							while(n < teste.length){
								fs.writeFile('./public/contest/'+id_competition+'/in_teste'+nome_final[x]+'-'+n+'.txt', teste[n], (err) => {  
									// throws an error, you could also catch it here
									if (err) throw err;
								});
								n++;
							}
						}
					});
				}
				if(feito == 0){
					unzip_problem();
					feito = 1;
				}								
				setTimeout(cad_problems, 2000);
			}
			res.redirect('/competition/');
		});
	});
}


*/ 


/* ------------------------- */

/* COMPARAÇÃO DE RESULTADO */
// const exec = require('child_process').exec;
// const fs = require('fs');
// var cmd = require('node-cmd');				

// function criando_executavel() {
// 	cmd.run('g++ ./public/resolutions/'+filename+' -o '+filename+'.exe');
// }

// function gerando_saida() {
// 	var S = require('string');
// 	fs.readFile('./public/contest/5b0f13953b3a602398f2350a/in_teste2.txt', 'utf-8', function (err, data) {
// 		var n = 0;
// 		var teste = S(data).splitLeft(';');
// 		while(n < 2){
// 			console.log(teste[n]);
// 			fs.writeFile('./public/resolutions/teste'+n+'.txt', teste[n], (err) => {  
// 				// throws an error, you could also catch it here
// 				if (err) throw err;
			
// 				// success case, the file was saved
// 				console.log('Lyric saved!');
// 			});
// 			// cmd.run(teste[n]+'> ./public/resolutions/teste'+n+'.txt')
// 			// cmd.run(filename+'.exe < '+teste[n]+' > ./public/resolutions/'+filename+'.txt');
// 			n++;
// 		}
// 	});
// }

// function excluindo_executavel() {
// 	fs.unlinkSync(filename+'.exe');
// }
// function comparando_resultado(){
// 	fs.readFile('./public/resolutions/'+filename+'.txt', 'utf-8', function (err, data) {
// 		// if(err) throw err;
		
// 		fs.readFile('./public/contest/5b0f13953b3a602398f2350a/out_teste1.txt', 'utf-8', function (err2, data2) {
// 			// if(err2) throw err2;
			
// 			console.log(data);
// 			console.log(data2);
// 			if(data2 == data)
// 				console.log("codigo Aceito");
// 			else
// 				console.log("codigo nao aceito");
// 		});
// 	});
// }
// criando_executavel();
// // Esperando 2 segundos
// setTimeout(gerando_saida, 3000);
// // Esperando 3 segundos
// setTimeout(comparando_resultado, 5000);
// // Esperando 5 segundos
// setTimeout(excluindo_executavel, 8000);
// res.redirect('/competition/');
/*  ----------------- */
