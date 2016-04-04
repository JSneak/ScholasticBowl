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
//var HostClass = require('./HostClass');
//var UserClass = require('./UserClass');
//var HostSession = [];//This contains the DJ Name and Code 
//var UserSession = [];//This contains the Guest Name, the code entered, and their vote 
var Rooms = [];
var usernames = [];//{}for json data, but we use [] because of the way we store the data
var UniqueCode = true;//If else statement for genRand()
var ValidCode = false;
var genCode;//User Code 
var NumberOfGuests = 0;

io.on('connection', function (socket) {

socket.on("Create Session", function(Data){
		genRand();
		var Name = Data.hostName;
		var Team = Data.hostTeam;
		socket.username = Name;
		socket.room = genCode;
		usernames.push({userName: Name, code:genCode, NumTeam:Team, rank:"Host"});
		Rooms.push(genCode);
		socket.join(genCode);
		socket.emit('recieve code', {
			Code: genCode
		});
	});
	
socket.on("join session", function(Code){//Checks the code
		ValidCode = false;
		var GivenName = Code.dataName;
		var GivenCode = Code.dataCode;
		var GivenTeam = Code.dataTeam;//Implement Later
		var GroupList = [];
		
		for(i=0;i<Rooms.length;i++)
		{
			if(GivenCode == Rooms[i])
			{
				NumberOfGuests++;
				ValidCode = true;
				socket.room = Rooms[i];
				socket.username = GivenName;
				socket.team = GivenTeam;
				usernames.push({userName:GivenName, code:GivenCode, team:GivenTeam, rank:"User"});
				socket.join(Rooms[i]);
				if(NumberOfGuests != 0)
				{
					for(j=0;j<=NumberOfGuests;j++)
					{
						if(usernames[j]['code'] == GivenCode)
						{
							if(usernames[j]['rank'] != "Host")
							{
							GroupList.push(usernames[j]['userName']);
							}
						}
					}
				}else{
							GroupList.push(GivenName);
				}
				
				socket.emit('user recieve code', {
					Code: GivenCode
				});//returns back to the caller
				io.sockets.emit('displayName', {
					Code:GivenCode,
					List:GroupList
				});//returns to everyone

			}
		}
		console.log(usernames);
		if(ValidCode == false)
		{
			socket.emit('Bad Code', {
				result:false
			});			
		}	
	});

	
//Start Session doesn't work at all Trace all the way back
socket.on("Start Session", function(Data){
	var GivenCode = Data.code;
	io.sockets.emit('start session', {
					Code:GivenCode
				});
});

socket.on("buzz event", function(Data){
	
	io.sockets.emit('restrict', {
		Code:Data.userCode
	});
	io.sockets.emit('someone buzzed', {
		Code:Data.userCode,
		PlayerName:Data.userName,
		PlayerTeam:Data.userTeam
	});
});

socket.on("Correct Reset", function(Data){
	io.sockets.emit('unrestrict', {
		Code:Data.code
	});
});

socket.on("Wrong Reset", function(Data){
	io.sockets.emit('unrestrict', {
		Code:Data.code
	});
});

socket.on("End Session", function(Data){
	delete usernames[socket.username];
	socket.leave(socket.room);
	io.sockets.emit('end of session', {
		Code:Data.code
	});
});
socket.on('disconnect', function(){
	// remove the username from global usernames list

	//delete usernames[socket.username];
	//socket.leave(socket.room);
	//console.log("Disconnection from Chriz");
	//console.log(usernames);
	
	
	
	// remove the username from global usernames list
	console.log(socket);
	var i = usernames.indexOf(socket.username)
	console.log(usernames[i]);//returns undefined
	usernames.splice(i, 1);
	socket.leave(socket.room);
	console.log("Disconnection from Chriz");
	console.log(usernames);
	});

});

	
	
function genRand()	{
	genCode = Math.floor(Math.random() * 100000);
	var HostNumber = 0;
		for(i=0;i<usernames.length;i++)
		{
			if(usernames[i]['rank'] == 'Host')
			{
				HostNumber++;
			}
		}

		for(i=0;i<HostNumber;i++)
		{
			if(usernames[i]['rank'] == 'Host')
			{
				if(usernames[i]['code'] == genCode)
				{
				UniqueCode = false;
				break;
				}
			}
		}
		if(UniqueCode == false)
		{
			UniqueCode = true;
			genRand();
		}
}		

function send404Response(response){
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("Error 404: Page not found!");
	response.end();
};

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 3000, function () {
  console.log('Server listening at port %d 3000');
});
