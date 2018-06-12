var fs = require('fs');
var unzip = require('unzip');

module.exports = function(app) {

  	var Contests = app.models.contests;

 	var IndexController = {
		index: function(req,res) {
      		res.render('index', { title: 'Online Judge INATEL' });
    	}
  	}

  	return IndexController;
}
