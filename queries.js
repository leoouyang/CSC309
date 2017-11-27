

var pgp = require('pg-promise')();
pgp.pg.defaults.ssl = true;
var db = pgp('postgres://ktwmjdndbbwody:0c1501bca6d9812c2ea6f9e15c7ff51d257fc54d7ca07af1554bb4c63c13fa5f@ec2-107-22-160-199.compute-1.amazonaws.com:5432/d2619khl4dkvco');




function addChampions(champ) {
  const cs = new pgp.helpers.ColumnSet(['id', 'name', 'armor', 'armorperlevel',
  'attackdamage', 'attackdamageperlevel', 'attackrange', 'attackspeedoffset',
  'attackspeedperlevel', 'crit', 'critperlevel', 'hp', 'hpperlevel', 'hpregen',
  'hpregenperlevel', 'movespeed', 'mp', 'mpperlevel', 'mpregen', 'mpregenperlevel',
  'spellblock', 'spellblockperlevel', 'image_url', 'big_image_url'], {table:'champion'});
  const values = champ;
  const query = pgp.helpers.insert(values, cs);

  db.none('truncate table champion;' + query)
	.then(function(){
		console.log("champions refreshed");
    })
    .catch(function (err) {
		console.log("Error:", err);
    });
}

function addPlayers(player) {
  const cs = new pgp.helpers.ColumnSet(['id', 'name', 'first_name', 'last_name',
'role', 'hometown', 'image_url', 'current_team_name', 'current_team_url'],
  {table:'player'});
  const values = [];
  for (i in player){
	  var team_name, team_image;
	  if (player[i].current_team == null){
		team_name = null;
		team_image = null;
	  }else{
		  team_name = player[i].current_team.name;
		  team_image = player[i].current_team.image_url;
	  }
	  values.push({'id':player[i].id, 'name':player[i].name, 'first_name':player[i].first_name, 'last_name':player[i].last_name,
'role':player[i].role, 'hometown':player[i].hometown, 'image_url':player[i].image_url, 'current_team_name':team_name, 'current_team_url':team_image})
	
  }
  const query = pgp.helpers.insert(values, cs);

  db.none('truncate table player;'+ query)
	.then(function(){
		console.log("players refreshed");
    })
    .catch(function (err) {
		console.log("Error:", err);
    });
}

function getAllChampions(req, res, next) {
  db.any('select * from champion')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL champions'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getNameChampions(req, res, next) {
  db.any('select * from champion where name like \'%$1%\'', req.query.name)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved champions with name'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllPlayers(req, res, next) {
  db.any('select * from player limit 12 offset %1', (req.query.page - 1) * 12)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL players with page'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function searchPlayers(req, res, next) {
  db.any('select * from player where role = $1 and name like \'%$2%\' limit 12 offset $3',
  req.query.role, req.query.name, req.query.page)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved players with role and name'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function addLike(req, res, next, userID) {
  db.none('insert into liked(userID, champName, preferrenceLvl)' +
      'values($1, $2, 5)', userID, req.body.champName)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Liked one champion'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateLike(req, res, next) {
  req.body.id = parseInt(req.body.id);
  req.body.preferrenceLvl = parseInt(req.body.preferrenceLvl);
  db.none('update liked set preferrenceLvl=$1 where id=$2',
    [req.body.preferrenceLvl, req.body.id])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated like'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function deleteLike(req, res, next) {
  var likeID = parseInt(req.params.id);
  db.result('delete from liked where id = $1', likeID)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: 'Deleted like'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getLike(req, res, next, userID) {
  db.any('select like.id, url, name, preferrenceLvl from liked left join champion on liked.champName=champion.name where userID = $1', userID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved players with role'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function validateUser(req, res, next) {
  db.result('select id, password from users where username = $1', req.body.username)
    .then(function (result) {
		console.log("user result", result)
		if(result[0].password == req.body.password){
			req.session.userID = result[0].id
			res.status(200)
			.json({
				status: 'success',
				message: 'Added one user'
			});
		}else{
			return false;
		}
    })
    .catch(function(err) {
      return next(err);
    });
}


function addUser(req, res, next) {
  req.body.id = parseInt(req.body.id);
  db.none('insert into users(id, username, password, isadmin)' +
      'values(${id}, ${username}, ${password}, false)', req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Added one user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function addMessage(req, res, next) {
  db.none('insert into message(text)' + 'values(${text})', req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Added one message'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function deleteMessage(req, res, next) {
  var messageID = parseInt(req.params.id);
  db.result('delete from message where id = $1', messageID)
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: 'Deleted message'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}



module.exports = {
  addChampions: addChampions,
  addPlayers: addPlayers,
  getAllChampions: getAllChampions,
  getNameChampions: getNameChampions,
  getAllPlayers: getAllPlayers,
  searchPlayers: searchPlayers,
  addLike: addLike,
  deleteLike: deleteLike,
  updateLike: updateLike,
  getLike: getLike,
  validateUser: validateUser,
  addUser: addUser,
  addMessage: addMessage,
  deleteMessage: deleteMessage
};
