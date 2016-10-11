var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var db = require('./db.js');

var middleware = require('./middleware.js')(db);



var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send("TODO API root");
});

//GET /todos?completed=true
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;

	var where = {};
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: "%" + query.q + "%"
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoId = parseInt(req.params.id);
	var matchedTodo = db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});

});

// POST request (can send data in the request) /todos

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "no todo with that id"
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	});


});

// PUT /todos/:id

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id);
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description') && body.description.trim().length > 0) {
		attributes.description = body.description.trim();
	}


	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

// POST /users

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});

// POST /users/login

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body).then(function(user){
		var token = user.generateToken('authentication');
		if (token){
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
		
	}, function(e){
		res.status(401).send();
	});

});



db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port ' + PORT);
	});
});



