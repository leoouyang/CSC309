const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const PORT = process.env.PORT || 3000;
const app = express();
const token = 'token=AZo91-wrT9J6f-O2eSfj6uxv1eTpvgsKl5ohVObmTeKY388sZ_U'
const db = require('./queries')

app.use(cookieParser());
app.use(session({secret: "CSC309"}));
app.use('/static', express.static(__dirname + '/view'));

//test the session
app.get('/api/validation', db.validateUser);

app.get('/main', function(req, res) {
    res.sendFile('view/index.html', {root: __dirname})
});

app.get('/api/test', function(req, res){console.log(req.session.userID)});

var champ_url = 'https://api.pandascore.co/lol/champions'
function getChampsPage(page) {
	return new Promise((resolve, reject) => {
		const request = require('request')
		request.get(champ_url + '?' + token + "&page="+ page + '&per_page=100', function (err,res, body) {
			console.log("page:", page)
			if(err) {
				reject(err)
			}
			if (res.statusCode === 200){
				var data = JSON.parse(body)
				resolve([data,res.headers['x-total']])
			}
		})
	})
}

function getchamps(){
	getChampsPage(1)
	.then(value => {
		var pageNum = Math.floor(value[1]/100)+1;
		var result = value[0]
		champ_promises = []
		for (var i = 2; i <= pageNum; i++){
			champ_promises.push(getChampsPage(i))
		};
		Promise.all(champ_promises).then(values => {
			for (var value in values){
				result = result.concat(values[value][0])
			}
			console.log(result.length);
			db.addChampions(result);
		}).catch(reason => { 
		  console.log(reason)
		});
	});
}

var player_url = 'https://api.pandascore.co/lol/players'
function getPlayersPage(page) {
	return new Promise((resolve, reject) => {
		const request = require('request')
		request.get(player_url + '?' + token + "&page=" + page + '&per_page=100', function (err,res, body) {
			console.log("page:", page)
			if(err) {
				reject(err)
			}
			if (res.statusCode === 200){
				var data = JSON.parse(body)
				resolve([data,res.headers['x-total']])
			}
		})
	})
}

function getplayers(){
	getPlayersPage(1)
	.then(value => {
		var pageNum = Math.floor(value[1]/100)+1;
		var result = value[0]
		player_promises = []
		for (var i = 2; i <= pageNum; i++){
			player_promises.push(getPlayersPage(i))
		};
		Promise.all(player_promises).then(values => {
			for (var value in values){
				result = result.concat(values[value][0])
			}
			console.log(result.length);
			db.addPlayers(result);
		}).catch(reason => { 
		  console.log(reason)
		});
	});
}
//43200000 12 hour
//getchamps();
//getplayers();
var refresh = setInterval(function(){getchamps();getplayers();}, 86400000);



app.listen(PORT, function(){
	console.log('listening on', PORT);
});