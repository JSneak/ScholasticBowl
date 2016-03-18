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
		genRand();

		var Name = Data.hostName;
		var Team = Data.hostTeam;
		HostSession[NumberOfHosts] = HostClass();
		HostSession[NumberOfHosts].HostCode = genCode;
		HostSession[NumberOfHosts].HostSessionName = Name;
		HostSession[NumberOfHosts].NumberOfTeams = Team;
		socket.emit('recieve code', {
			Code: genCode
		});
		console.log(HostSession[NumberOfHosts].HostCode + ", " + HostSession[NumberOfHosts].HostSessionName + "  <-- New Session");
		console.log(HostSession.length + " <-- Number of People in the Session");
		NumberOfHosts++;
	});
	
socket.on("join session", function(Code){//Checks the code
		ValidCode = false;
		var GroupList = [];
		if(NumberOfGuests != 0)
		{
				for(i=0;i<=NumberOfGuests;i++)
				{
					if(HostSession[i].HostCode == GivenCode)
					{
						ValidCode = true;
						break;
					}
				}
		
		}else{
				var GivenName = Code.dataName;
				var GivenCode = Code.dataCode;
				var GivenTeam = Code.dataTeam;
			if(HostSession.length != 0)
			{
				if(HostSession[0].HostCode == GivenCode)
				{
					ValidCode = true;
					
				}
			}else{console.log("Step 2");
				socket.emit('Bad Code',{
					result:false
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
				console.log(NumberOfGuests + " <--- Number of People in the array");
				console.log(UserSession[NumberOfGuests].UserName + ", " + UserSession[NumberOfGuests].UserCode + " <----- Players Info");
				//console.log(UserSession[NumberOfGuests]);
				//console.log(NumberOfGuests + " This is number of Guests");
				if(NumberOfGuests != 0)
				{
					for(i=0;i<=NumberOfGuests;i++)
					{
						if(UserSession[i].UserCode == GivenCode)
						{
							GroupList.push(UserSession[i].UserName);
						}
					}
				}else{
						if(UserSession[0].UserCode == GivenCode)
						{
							GroupList.push(UserSession[0].UserName);
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
	var Temp = 0;
	var TempArray = [];
	var GivenCode = Data.codea;
	for(i=0;i<NumberOfGuests;i++)
	{
		if(GivenCode == UserSession[i].UserCode)
		{
			TempArray.push(i);
			Temp++;
		}
	}
	for(i=TempArray.length;i>0;i--)
	{
		var Space = TempArray[i-1];
		UserSession.splice(Space,1);
	}
	NumberOfGuests = NumberOfGuests - Temp;
	
	for(i=0;i<NumberOfHosts;i++)
	{
		if(GivenCode == HostSession[i].HostCode)
		{
			HostSession.splice(i, 1);
			NumberOfHosts--;
		}
	}
	io.sockets.emit('disconnect', {
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

/* app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
}); */
server.listen(process.env.PORT || 3000, function () {
  console.log('Server listening at port %d 3000');
});
