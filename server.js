var express = require('express');
var bodyParser = require('body-parser');

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

	/*
	if (todos[Number(req.params.id) - 1]){
		res.json(todos[Number(req.params.id) - 1]);
	} else {
		res.status(404).send();
	}
	*/

	var todoId = parseInt(req.params.id);
	var matchedTodo;
	todos.forEach(function(todo){
		if (todoId === todo.id){
			matchedTodo = todo;
		}
	});

	if (matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}


});

// POST request (can send data in the request) /todos

app.post('/todos', function (req, res){
	var body = req.body;
	body.id = todoNextId++;
	todos.push(body);

	console.log('description ' + body.description);
	res.json(body);
});



//GET /todos
//GET /todos/:id

app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});