var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];

app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send("TODO API root");
});

//GET /todos?completed=true
app.get('/todos', function(req, res) {
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

app.get('/todos/:id', function(req, res) {

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

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		return res.status(404).json({
			"error": "todo with that id not found"
		});
	}
	todos = _.without(todos, matchedTodo);

	console.log(todos);

	res.json(todos);


});

// PUT /todos/:id

app.put('/todos/:id', function(req, res) {
	var body = req.body;
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		return res.status(404).json({
			"error": "todo with that id not found"
		});
	}

	body = _.pick(body, 'description', 'completed');
	var validAttributes = {};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	} else {
		//completed was never provided, oh well, not a biggie
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	} else {
		//completed was never provided, oh well, not a biggie
	}


	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);

	//JS passes by reference so matchedTodo will actually be updated inside todos array

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express server started on port ' + PORT);
	});
});