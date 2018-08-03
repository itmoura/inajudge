module.exports = function(app){
	var index = app.controllers.index; // pega da pasta controllers, o controllers esta setado em load
 	app.get('/', require('connect-ensure-login').ensureLoggedIn(), index.index);
};
