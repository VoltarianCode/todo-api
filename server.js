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
}];

app.get('/', function(req, res){
	res.send("TODO API root");
});

app.get('/todos', function(req, res){
	res.json(todos);
});



//GET /todos
//GET /todos/:id

app.listen(PORT, function(){
	console.log('Express server started on port ' + PORT);
});