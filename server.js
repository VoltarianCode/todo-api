var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function(req, res){
	res.send("TODO API root");
});

app.get('/todos', function(req, res){
	res.json(todos);
});

app.get('/todos/:id', function(req, res){

	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	
	if (matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

});

// POST request (can send data in the request) /todos

app.post('/todos', function (req, res){
	var body = req.body;
	body = _.pick(body, 'description', 'completed');
	if(!_.isString(body.description) 
		|| !_.isBoolean(body.completed) 
		|| body.description.trim().length == 0){

		return res.status(400).send();
	}

	body.description = body.description.trim();
	body.id = todoNextId++;
	todos.push(body);

	console.log('description ' + body.description);
	res.json(body);
	
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(!matchedTodo){
		return res.status(404).json({"error": "todo with that id not found"});
	}
	todos = _.without(todos, matchedTodo);

	console.log (todos);

	res.json(todos);


});

// PUT /todos/:id

app.put('/todos/:id', function (req, res){
	var body = req.body;
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(!matchedTodo){
		return res.status(404).json({"error": "todo with that id not found"});
	}

	body = _.pick(body, 'description', 'completed');
	var validAttributes = {};
	
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')){
		return res.status(400).send();
	} else {
		//completed was never provided, oh well, not a biggie
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')){
		return res.status(400).send();
	} else {
		//completed was never provided, oh well, not a biggie
	}
	

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);

	//JS passes by reference so matchedTodo will actually be updated inside todos array

});


app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});