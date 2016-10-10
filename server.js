var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Join a HackerRank contest',
	completed: false
}, {
	id: 2,
	description: 'Remember to eat, humans cannot photosynthesize',
	completed: false
}, {
	id:3,
	description: 'breathe',
	completed: true
}];

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



//GET /todos
//GET /todos/:id

app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});