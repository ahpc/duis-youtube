var http = require('http'), request = require('request');
var cheerio = require('cheerio'), $ = null;
var express = require('express');
var app = require('express')();
var http2 = require('http').Server(app);
var io = require('socket.io')(http2);
var target = 'https://www.youtube.com/watch?v=DVeWuBt8zf8';
var playerPage = null, html = null, sideBarPage = null, html2 = null, appendSideBar = null, appendPlayer = null;
	
function sideBarContent(targetUrl){
	request(targetUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			html = body.replace(/\<\/body\>/g, '</div><script src="https://code.jquery.com/jquery-2.2.1.js"></script><script src="https://cdn.socket.io/socket.io-1.2.0.js"></script><script> var socket = io(); function sendid(thisId){ socket.emit("channel1", thisId); return false; } socket.on("channel3", function(appendbody){ document.getElementById("appendBody").innerHTML = appendbody;});</script></body>');
			$ = cheerio.load(html);
			$('body').prepend('<div id="appendBody">');
			sideBar = $('#watch7-sidebar-contents').html().replace(/href="\/watch\?v\=/g, 'onclick="sendid(this.id)" id="');
			$('#watch7-sidebar-contents').text('');
			$('#player').text('');
			$('#watch7-content').text('');
			$('#placeholder-player').text('');
			$('#watch7-sidebar-contents').html(sideBar);
			sideBarPage = $('html').html();
		}
	});
}

function playerContent(targetUrl){
	request(targetUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			html2 = body.replace(/\<\/body\>/g, '</div><script src="https://code.jquery.com/jquery-2.2.1.js"></script><script src="https://cdn.socket.io/socket.io-1.2.0.js"></script> <script> var socket = io(); socket.on("channel2", function(appendbody){ document.getElementById("appendBody").innerHTML = appendbody;}); socket.on("channel4", function(videoId){ var Youtubeplayer = document.getElementById("youtubetplayer"); $(Youtubeplayer).attr("src", "http://www.youtube.com/embed/"+videoId+"?autoplay=1"); });</script></body>');
			$ = cheerio.load(html2);
			$('body').prepend('<div id="appendBody">');
			$('#watch7-sidebar-contents').text('');
			$('#placeholder-player').text('');
			$('#player').text('');
			$('#player').html('<iframe id="youtubetplayer" type="text/html" width="854" height="480" src="http://www.youtube.com/embed/DVeWuBt8zf8?autoplay=0" frameborder="0"></iframe>');
			playerPage = $('html').html();
		}
	});
}

function sideBarContentSwitch(Url){
	request(Url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			sideBar = $('#watch7-sidebar-contents').html().replace(/href="\/watch\?v\=/g, 'onclick="sendid(this.id)" id="');
			$('#watch7-sidebar-contents').text('');
			$('#player').text('');
			$('#watch7-content').text('');
			$('#placeholder-player').text('');
			$('#watch7-sidebar-contents').html(sideBar);
			appendSideBar = $('body').html();
		}
	});
}

function playerContentSwitch(Url){
	request(Url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			$('#watch7-sidebar-contents').text('');
			$('#placeholder-player').text('');
			$('#player').text('');
			$('#player').html('<iframe id="youtubetplayer" type="text/html" width="854" height="480" src="http://www.youtube.com/embed/80EWDV7ZRjw?autoplay=0" frameborder="0"></iframe>');
			appendPlayer = $('body').html();
		}
	});
}

function sendVideoId(Id){
	var url = 'https://www.youtube.com/watch?v=' + Id;
	sideBarContentSwitch(url);
	playerContentSwitch(url);
	io.emit('channel3', appendSideBar);
	io.emit('channel2', appendPlayer);
	io.emit('channel4', Id);
}

sideBarContent(target);
playerContent(target);

app.get('/sidebar', function(req, res){
  res.send('<!DOCTYPE html><html>'+sideBarPage+'</html>');
});

app.get('/player', function(req, res){
  res.send('<!DOCTYPE html><html>'+playerPage+'</html>');
});

http2.listen(5000, function(){
  console.log('listening on *:5000');
});

io.on('connection', function(socket){
	socket.on('channel1', function(videoId){
		sendVideoId(videoId);
	});
});