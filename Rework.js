var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express'); //Module for interface
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json({ type: 'application/*+json' })); 
var HostClass = require('./HostClass');
var UserClass = require('./UserClass');
var HostSession = [];//This contains the DJ Name and Code 
var UserSession = [];//This contains the Guest Name, the code entered, and their vote 
var UniqueCode = true;//If else statement for genRand()
var ValidCode = false;
var genCode;//User Code 
var NumberOfHosts = 0;
var NumberOfGuests = 0;


io.on('connection', function (socket) {
	
	socket.on("generate session", function(Name){
		NumberOfHosts++;
		console.log(Name)
		genRand();
		HostSession[NumberOfHosts].HostSessionName = Name;
		HostSession[NumberOfHosts].HostCode = genCode;
		socket.broadcast.emit('recieve code', {
			Code: genCode
		});	
	});
	
	socket.on("join session", function(Code){//Checks the code
		for(i=0;i<NumberOfGuests;i++)
		{
			if(HostSession[i].HostCode == Code.userCode)
			{
				NumberOfGuests++;
				ValidCode = true;
				TempHolder = i;//This holds the position to store data
				break;
			}else{
				ValidCode = false;
				socket.broadcast.emit('Bad Code', {
					result: false
				});
				break;
			}	
		}
			if(ValidCode == true)
			{
				UserSession[TempHolder].UserName = Code.username;
				UserSession[TempHolder].UserResponse = "";
				UserSession[TempHolder].UserCode = Code.userCode;
			}
	});
});
	
	
	
	
function genRand()	{
	genCode = Math.floor(Math.random() * 100000);
	if(NumberOfHosts != 1)
	{
		for(i=0;i<NumberOfHosts;i++)
		{
			if(HostSession[i].HostCode == genCode)
			{
				UniqueCode = false;
				break;
			}
		}
		if(UniqueCode == false)
		{
			UniqueCode = true;
			genRand();
		}
	}
	}		

function send404Response(response){
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("Error 404: Page not found!");
	response.end();
};

app.use(express.static(__dirname + '/public'));

server.listen(8080, function () {
  console.log('Server listening at port %d 8080');
});