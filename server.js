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
	if(!_.isString(body.description) 
		|| !_.isBoolean(body.completed) 
		|| body.description.trim().length == 0){

		return res.status(400).send();
	} else {
		body.id = todoNextId++;
		todos.push(body);

		console.log('description ' + body.description);
		res.json(body);
	} 


	
});



//GET /todos
//GET /todos/:id

app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});