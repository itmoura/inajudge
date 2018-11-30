var fs = require('fs');
var readline = require('readline');
var unzip = require('unzip');
var moment = require('moment');
var S = require('string');
var cmd = require('node-cmd');
var Promise = require('bluebird');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
const PowerShell = require("powershell");


module.exports = function(app) {

	var Contest = app.models.contests;
	var Problem = app.models.problems;
	var Submit = app.models.submits;	
	var Users = app.models.users;
	var Esclarecimento = app.models.esclarecimentos;		
	moment.locale('pt-BR');
	
 	var CompetitionController = {
		index: function(req,res) {
			Contest.find().sort( {'_id': -1} ).exec(function(err, data){
				if (err) {
					console.log('Erro na busca de todas as competicoes: '+err);
				}
				var data_atual = moment().format();
				var hora_atual = moment().format('LT'); 
				res.render('competition/index', { title: 'Veja todas as competições', listContests: data, moment: moment, data_atual: data_atual, user: req.user, hora_atual: hora_atual, string: S });
			});
		},
		valida_senha: function(req,res){
			var senha = req.body.senha;
			var _id = req.body._id;
			Contest.findOne({ _id: _id }, function(err, data){
				if (err) {
					console.log('Erro na procura da competicao (entrada da sala): '+err);
				}
				if(data.senha == senha){
					var id_user = req.user._id;
					Users.findOne(id_user, function(err, data2){
						if (err) {
							console.log(err);
						} else {
							var model = data2;
							var quebra_competicao = S(data2.competicoes).parseCSV(",");
							var qnt = quebra_competicao.length;
							var achou = false;
							for(var i = 0; qnt > i; i++){
								if(quebra_competicao[i] == data._id){
									achou = true;
									break;
								}								
							}
							if(achou == false){
								model.competicoes = model.competicoes + ',' + data._id;
								model.save(function(err){
									if (err) {
										console.log(err);
									} else{
										Contest.findOne(data._id, function(err, dataContest){
											var modelContest = dataContest;
											modelContest.competidores = modelContest.competidores + ',' + id_user;
											modelContest.save(function(err){
												if (err) {
													console.log(err);
												} else{
													res.sendStatus(200).send();
												}
											});
										});
									}
								});
							} else {
								res.sendStatus(200).send();
							}
						}
					});
				}
				else {
					res.sendStatus(403).end();
				}
			});
		},
		room: function(req,res) {
			var quebra_competicao = S(req.user.competicoes).parseCSV(",");
			var qnt = quebra_competicao.length;
			var achou = false;
			for(var i = 0; qnt > i; i++){
				if(quebra_competicao[i] == req.params.id){
					achou = true;
					break;
				}								
			}
			if(achou == true){
				Contest.findById(req.params.id, function(err, data){
					if (err) {
						console.log('Deu erro em room'+err);
					} 
					else {
						Problem.find({'id_competition': data._id}, function(err, data2){
							if (err) {
								console.log('Deu erro em room'+err);
							}
							Esclarecimento.find({'id_competition': data._id}, function(err, data_esclarecimento){
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
											rank: rank, user: req.user, moment: moment, esclarecimento: data_esclarecimento});
									});
								});
								});
							});
						});
					}
				});
			} else {
				res.redirect('/competition');
			}
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
		cad_problema: function(req,res) {
			res.render('competition/problema', { title: 'Cadastre problema', id_competition: req.params.id });
	  	},
		create: function(req,res) {
	  		res.render('competition/create', { title: 'Crie sua competição' });
		},
		submitProblem: function(req, res, next){
			function judge(){
				var qnt = 2;
				for(var i = 0; i < 10000000; i++){
				}
				var aceitacao = 0;
				var recusado = 0;
				for(var ij = 1; ij <= qnt; ij++){
					// $data1 = Get-Date -format ss
					let ps = new PowerShell
					(`
						$data1 = Get-Date -format fff
						$data1 = 999 - $data1
						$proc = Start-Process -FilePath './public/jugamento.exe' -RedirectStandardInput './public/contest/`+id_room+`/`+id_problem+`/in`+ij+`.txt' -RedirectStandardOutput './public/respostas/`+id_sub+`-`+ij+`.txt' -PassThru -Wait -WindowStyle Maximized
						$timeouted = 4
						$proc | Wait-Process -Timeout 1 -ErrorAction SilentlyContinue -ErrorVariable timeouted 
						$data2 = Get-Date -format fff
						$data2 = 999 - $data2
						$tempo = $data1 - $data2
						if ($timeouted){
							echo 0
							$proc.Kill()
						} else {
							echo `+ij+`
						}
					`);
					// Clear-Content -Path './public/respostas/`+id_sub+`-`+ij+`.txt' -Force
					// Add-Content -Path './public/respostas/error-`+id_sub+`-`+ij+`.txt' -Value 1
					// $data2 = Get-Date -format ss
					// 	$tempo = $data2 - $data1
					// ps.on("error", err => {
					// 	console.error(err);
					// });					 
					// // Stdout
					// ps.on("output", data => {
					// 	console.log("output aqui -");
					// 	console.log(data);
					// });					 
					// // Stderr
					// ps.on("error-output", data => {
					// 	console.error(data);
					// });					 
					// // End
					ps.on("output", data => {
						console.log("Aqui: ", data);
						var esperado = fs.readFileSync('./public/contest/'+id_room+'/'+id_problem+'/out'+data+'.txt', 'utf-8');
						var resultado = fs.readFileSync('./public/respostas/'+id_sub+'-'+data+'.txt', 'utf-8');
						console.log("Eserado: ", esperado);
						console.log("Resultado: ", resultado);
						if(esperado == resultado){
							aceitacao = aceitacao + 1;
							console.log(data, ": aceito")
						} else {
							console.log("Código recusado");
							recusado = recusado + 1;
							let remove = new PowerShell('Remove-Item ./public/jugamento.exe');
							ij = qnt;
						}
					});
				}
				// for(var ij = 1; ij <= qnt; ij++){
					// var resultado 
					// let teste;
					// var esperado = fs.readFile('./public/contest/'+id_room+'/'+id_problem+'/out'+ij+'.txt', 'utf-8', function (err2, esperado) {
					// 	console.log("Esperado: ", esperado);
					// });					
					// var resultado = fs.readFile('./public/respostas/'+id_sub+'-'+ij+'.txt', 'utf-8', function (err, resultado) {
					// 	console.log("Resultado: ", resultado);
					// });
					
					// console.log("Resultado: ", resultado);
					// console.log("Esperado: ", esperado);
					// fs.readFile('./public/respostas/'+id_sub+'-'+ij+'.txt', 'utf-8', function (err, resultado) {
					// 	if (err) {
					// 		console.log(err);
					// 	} else {
					// 		fs.readFile('./public/contest/'+id_room+'/'+id_problem+'/out'+ij+'.txt', 'utf-8', function (err2, esperado) {
					// 			if (err2) {
					// 				console.log(err2);
					// 			} else {
					// 				console.log("Resultado: ");
					// 				console.log("Esperado: ");
					// 				// if(resultado == esperado){
					// 				// 	console.log("codigo Aceito");
					// 				// 	aceitacao = ij;
					// 				// } else {
					// 				// 	console.log("codigo nao aceito");
					// 				// 	recusado = ij;
					// 				// 	let remove = new PowerShell('Remove-Item ./public/jugamento.exe');
					// 				// 	return -1;
					// 				// }
					// 			}
					// 		});
					// 	}
					// });
					// cmd.run('jugamento.exe < ./public/contest/'+id_room+'/'+id_problem+'/in'+ij+'.txt > ./public/respostas/'+id_sub+'-'+ij+'.txt');
				// }
				let remove = new PowerShell('Remove-Item ./public/jugamento.exe');
				return -1;
			}
			var cont_sub = 0;
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
			var id_sub = model._id;
			Contest.findById(id_room, function(err, data_contest){
				var model_contest = data_contest;
				cont_sub = data_contest.cont_sub + 1;
				model_contest.cont_sub = cont_sub;
				model_contest.save(function(err){
					if (err) {
						console.log(err);
					}
					model.cont_sub = cont_sub;
					Problem.findOne({ _id: id_problem}, function(err, getLetra){
						if (err) {
							console.log('Deu erro em room'+err);
						}
						model.letra_problem = getLetra.letra;
						model.save(function(err){
							if (err) {
								console.log(err);
								res.write('<script>alert("Falha ao enviar!"); window.location="../"</script>');
							}
							else {
								cmd.run('g++ ./public/resolutions/'+filename+' -o ./public/jugamento.exe');
								for(var i = 0; i < 10000000; i++){
									var teste = i;
								}
								model.resposta = judge();						
								model.save(function(err){
									if (err) {
										console.log(err);
										res.write('<script>alert("Falha ao enviar!"); window.location="../"</script>');
									} else {
										res.redirect('/competition/room/'+id_room);
									}
								});
							}
						});
					  });
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
			model.cont_sub = 0;
			model.trava_placar = req.body.trava_placar;
			model.competidores = 1;
			var id = model._id;
			model.save(function(err){
				if (err) {
					console.log(err);
					res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
				}				
				res.redirect('/competition/room/'+id);
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
					// console.log(data);
					var model = data;
					var id_sala = data._id;
					// if(data.liberado == null){
					// 	model.liberado = true;
					// 	model.data_inicio = 
					// }
					var verifica = req.params.info;
					if(verifica == 'false')
						model.liberado = false;
					else if(verifica == 'true')
						model.liberado = true;
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
		esclarecimento: function(req, res, next){
			var model = new Esclarecimento;
			var id_competition = req.body.id_competition
			model.id_competition = id_competition;
			model.letra = req.body.letra;
			model.pergunta = req.body.pergunta;
			model.save(function(err){
				if (err) {
					console.log(err);
					res.write('<script>alert("Falha ao registrar duvida!"); window.location="../"</script>');
				}				
				res.redirect('/competition/room/'+id_competition+'#nav-esclarecimento');
	  		});
		},
		respesclarecimento: function(req, res, next){
			Esclarecimento.findById(req.params.id, function(err, data){
				if (err) {
					console.log('Deu erro em room'+err);
				}
				var model = data;
				model.resposta = req.body.resposta;
				model.save(function(err){
					if (err) {
						console.log(err);
						res.write('<script>alert("Falha ao responder!"); window.location="../"</script>');
					}		
					res.redirect('/competition/room/'+data.id_competition+'#nav-esclarecimento');
				});
			});
		},
		upload_problem: function(req, res, next){
			var model = new Problem;
			model.id_competition = req.body.id_competition;
			model.letra = req.body.letra;
			model.cor = req.body.cor;
			model.nome = req.body.nome;
			model.time = req.body.limit_time;
			model.titulo = req.body.title;
			model.descricao = req.body.description;
			model.txt_entrada = req.body.txt_entrada;
			model.txt_saida = req.body.txt_saida;
			model.exp_entrada = req.body.exp_entrada;
			model.exp_saida = req.body.exp_saida;
			model.filename = req.file.arquivo;
			var id = model._id;
			var id_competition = req.body.id_competition;
			model.save(function(err){
				if (err) {
					console.log(err);
					res.write('<script>alert("Falha ao cadastrar!"); window.location="../"</script>');
				}
				-fs.createReadStream('./public/contest/'+req.file.filename).pipe(unzip.Extract({ path: './public/contest/'+id_competition+'/'+id}));
				res.redirect('/competition/room/'+id_competition);
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
