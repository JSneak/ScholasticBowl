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
	
socket.on("generate session", function(Data){
		//console.log("Test 1 + " + Name);
		genRand();
		//console.log("Test 2 = " + genCode);
		var Name = Data.hostName;
		var Team = Data.hostTeam;
		HostSession[NumberOfHosts] = HostClass();
		HostSession[NumberOfHosts].HostCode = genCode;
		HostSession[NumberOfHosts].HostSessionName = Name;
		HostSession[NumberOfHosts].NumberOfTeams = Team;
		console.log("Test 3 = " + HostSession[NumberOfHosts].HostCode);
		socket.emit('recieve code', {
			Code: genCode
		});
		//console.log("Test 4");
		//console.log(HostSession.length + " All the people in host Session");
		NumberOfHosts++;
	});
	
socket.on("join session", function(Code){//Checks the code
		ValidCode = false;
		var GivenName = Code.dataName;
		var GivenCode = Code.dataCode;
		var GivenTeam = Code.dataTeam;
		var GroupList = [];
		//console.log("JS Test 1");
		if(NumberOfGuests != 0)
		{
			for(i=0;i<=NumberOfGuests;i++)
			{
				//console.log(Code);
				if(HostSession[i].HostCode == GivenCode)
				{
					ValidCode = true;
					
					break;
				}
			}
		}else{
				//NumberOfGuests++
				//console.log(Code);
				if(HostSession[0].HostCode == GivenCode)
				{
					ValidCode = true;
					
				}else{
					ValidCode = false;
					socket.emit('Bad Code', {
					result: false
					});
				}	
			}

			if(ValidCode == true)
			{
				//console.log(NumberOfGuests + "This is ");
				UserSession[NumberOfGuests] = UserClass();
				UserSession[NumberOfGuests].UserName = GivenName;
				UserSession[NumberOfGuests].UserResponse = "";
				UserSession[NumberOfGuests].UserCode = GivenCode;
				UserSession[NumberOfGuests].TeamNumber = GivenTeam;
				//console.log(UserSession[NumberOfGuests]);
				//console.log(NumberOfGuests + " This is number of Guests");
				if(NumberOfGuests != 0)
				{
					for(i=0;i<=NumberOfGuests;i++)
					{
						if(UserSession[i].UserCode == GivenCode)
						{
							GroupList.push(UserSession[i].UserName);
							//GroupList[i] = UserSession[i].UserName;
							//console.log(i + " This is place in array");
							//console.log(UserSession.length + " This is length of the UserSession");
						}
					}
				}else{
						if(UserSession[0].UserCode == GivenCode)
						{
							GroupList.push(UserSession[0].UserName);
							//GroupList[i] = UserSession[i].UserName;
							//console.log(0 + " This is the first iteration");
							//console.log(UserSession.length + " This is length of the UserSession");
							//console.log(UserSession.length);
						}
					}
				
				//console.log(GroupList + " Everyone in the group list array");
				socket.emit('user recieve code', {
					Code: GivenCode
				});//returns back to the caller
				io.sockets.emit('displayName', {
					Code:GivenCode,
					List:GroupList
				});//returns to everyone
				NumberOfGuests++;
			}else{
					ValidCode = false;
					socket.emit('Bad Code', {
					result: false
					});
				 }
	});

	
//Start Session doesn't work at all Trace all the way back
socket.on("Start Session", function(Data){
	console.log(Data.code);
	var GivenCode = Data.code;
	io.sockets.emit('start session', {
					Code:GivenCode
				});
});


});
	
	
	
function genRand()	{
	genCode = Math.floor(Math.random() * 100000);
	if(NumberOfHosts != 0)
	{
		for(i=0;i<NumberOfHosts;i++)
		{
			//console.log(genCode);
			//console.log(HostSession[i]);
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

server.listen(3000, function () {
  console.log('Server listening at port %d 3000');
});