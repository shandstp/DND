var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('mysql', mysql)
app.set('view engine', 'handlebars');
app.set('port', 7017);

var context = {};

function getGames(res, mysql, context, complete){
  mysql.pool.query("SELECT gameID, name FROM Games", function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.Game = results;
    complete();
  });
}

function getPlayers(res, mysql, context, complete){
  mysql.pool.query("SELECT firstName, lastName, playableChar AS playable, Games.name AS game, class, SpouseId, hitpointVal, humanoidID FROM Humanoids INNER JOIN Games ON Humanoids.gameID = Games.gameID", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.player = result;
    // console.log(result);
    complete();
  });
}

function getPlayersByGame(req, res, mysql, context, complete){
      var query = "SELECT firstName, lastName, playableChar AS playable, Games.name AS game, class, SpouseId, hitpointVal, humanoidID FROM Humanoids INNER JOIN Games ON Humanoids.gameID = Games.gameID WHERE Humanoids.gameID = ?";
      // console.log(req.params);
      var inserts = [req.params.gameid];
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.player = results;
            // console.log(context);
            // console.log(result);
            complete();
      });
}

function getDMs(res, mysql, context, complete){
  mysql.pool.query("SELECT firstName, lastName, experience, email, DMID FROM DungeonMasters", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.DM = result;
    // console.log(result);
    complete();
  });
}

function getGames(res, mysql, context, complete){
  mysql.pool.query("SELECT name, playerNum, firstName, lastName, gameID FROM Games INNER JOIN DungeonMasters ON dungeonMasterID = DMID", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.Game = result;
    // console.log(result);
    complete();
  });
}

function getItems(res, mysql, context, complete){
  mysql.pool.query("SELECT name, effect, type, cost, itemID FROM Items", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.Item = result;
    complete();
  });
}

function getItemsByPlayer(res, mysql, context, id, complete){
  var sql = "SELECT name, effect, type, cost, Items.itemID, Humanoids.humanoidID FROM Humanoids INNER JOIN ItemsHumanoids ON Humanoids.humanoidID = ItemsHumanoids.humanoidID INNER JOIN Items ON Items.itemID = ItemsHumanoids.itemID WHERE Humanoids.humanoidID = ?";
  var inserts = [id];
  mysql.pool.query(sql, inserts, function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.PlayerItem = result;
    complete();
  })
}

function getPlayer(res, mysql, context, id, complete){
  var sql = "SELECT firstName, lastName, Games.name AS gameName, class, hitpointVal, humanoidID, Games.gameID AS gameID FROM Humanoids INNER JOIN Games ON Humanoids.gameID=Games.gameID WHERE humanoidID = ?";
  var inserts = [id];
  mysql.pool.query(sql, inserts, function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.Player = result[0];
    complete();
  });
}

app.get('/', function(req,res){
   var context = {};
   res.render('home', context);
   return;
});


app.get('/Players', function(req,res){
  // console.log("Using /Players app.get route");
   var callbackCount = 0;
   var context = {};
   var mysql = req.app.get('mysql');
   getPlayers(res, mysql, context, complete);
   getGames(res, mysql, context, complete);
   function complete(){
      callbackCount++;
         if(callbackCount >= 2){
            res.render('players', context);
         }
   }
   // return;
});

app.delete('/Players/delItem/:itm/humanoid/:hum', function(req, res){
  // console.log(req.params.itm);
  // console.log(req.params.hum);
  var mysql = req.app.get('mysql');
  var sql = "DELETE FROM ItemsHumanoids WHERE itemID = ? AND humanoidID = ?";
  var inserts = [req.params.itm, req.params.hum];
  sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.status(400);
      res.end();
    }
    else{
      res.status(202).end();
    }
  })
})

app.get('/Players/delete/:humanoidID', function(req,res){
  // console.log("Taking /Players/delete route");
  var mysql = req.app.get('mysql');
  var sql = "DELETE FROM Humanoids WHERE humanoidID = ?";
  var inserts = [req.params.humanoidID];
  // console.log(req.body);
  sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    if(error){
      console.log(JSON.stringify(error));
      res.write(JSON.stringify(error));
      res.end();
    }
    else{
      res.redirect('/Players');
    }
  });
});

app.post('/Players', function(req, res){
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO Humanoids (firstName, lastName, playableChar, gameID, class, hitpointVal) VALUES ((SELECT NULLIF(?, '')),(SELECT NULLIF(?, '')),1,?,(SELECT NULLIF(?, '')),20)";
  var inserts = [req.body.firstname, req.body.lastname, req.body.gameName, req.body.class];
  sql = mysql.pool.query(sql,inserts,function(error,results,fields){
    if(error){
	if(error.sqlMessage == "Column 'firstName' cannot be null" || error.sqlMessage == "Column 'lastName' cannot be null" || error.sqlMessage == "Column 'class' cannot be null"){
		res.redirect('/Players');
	}
	else{
      		console.log(JSON.stringify(error));
      		res.write(JSON.stringify(error));
      		res.end();
	}
    }
    else{
      res.redirect('/Players');
    }

  });
});

app.get('/Players/charSheet/:humanoidID', function(req, res){
  callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getPlayer(res, mysql, context, req.params.humanoidID, complete);
  getItemsByPlayer(res, mysql, context, req.params.humanoidID, complete);
  getGames(res, mysql, context, complete);
  getItems(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 4){
      res.render('charSheet', context);
    }
  }
});


app.get('/Players/filter/:gameid', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getPlayersByGame(req, res, mysql, context, complete);
  getGames(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 2){
      res.render('players', context);
      return;
    }
  }
});

app.get('/DungeonMasters', function(req,res){
   var callbackCount = 0;
   var context = {};
   var mysql = req.app.get('mysql');
   getDMs(res, mysql, context, complete);
   function complete(){
     callbackCount++;
      if(callbackCount >= 1){
        res.render('dms', context);
      }
   }
   return;
});

app.post('/DungeonMasters', function(req, res){
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO DungeonMasters (firstName, lastName, experience, email) VALUES ((SELECT NULLIF(?, '')), (SELECT NULLIF(?, '')),?,?)";
  var inserts = [req.body.firstname, req.body.lastname, req.body.experience, req.body.dmEmail];
  sql = mysql.pool.query(sql,inserts,function(error,results,fields){
    if(error){
	if(error.sqlMessage == "Column 'firstName' cannot be null" || error.sqlMessage == "Column 'lastName' cannot be null"){
		res.redirect('/DungeonMasters');
	}
	else{
      		console.log(JSON.stringify(error));
      		res.write(JSON.stringify(error));
      		res.end();
	}
    }
    else{
      res.redirect('/DungeonMasters');
    }

  });
});

app.get('/Games', function(req,res){
   var callbackCount = 0;
   var context = {};
   var mysql = req.app.get('mysql');
   getGames(res, mysql, context, complete);
   function complete(){
     callbackCount++;
      if(callbackCount >= 1){
        res.render('games', context);
      }
   }
   return;
});

app.post('/Games', function(req, res){
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO Games (name, playerNum, dungeonMasterID) VALUES ((SELECT NULLIF(?, '')),10,(SELECT DMID FROM DungeonMasters WHERE firstName = (SELECT NULLIF(?, '')) AND lastName = (SELECT NULLIF(?, ''))))";
  var inserts = [req.body.name, req.body.firstname, req.body.lastname];
  sql = mysql.pool.query(sql,inserts,function(error,results,fields){
    if(error){
      if(error.sqlMessage == "Column 'dungeonMasterID' cannot be null" || error.sqlMessage == "Column 'name' cannot be null"){
        res.redirect('/Games');
      }
      else{
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      }
    }
    else{
      // console.log(sql);
      res.redirect('/Games');
    }

  });
});

app.get('/Items', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  getItems(res, mysql, context, complete);
  function complete(){
    callbackCount++;
    if(callbackCount >= 1){
      res.render('items', context);
    }
  }
  return;
});

app.post('/Players/charSheet/:humanoidID', function(req, res){
  // console.log("Taking /Players/charSheet/:humanoidID post route");
  var mysql = req.app.get('mysql');
  var sql = "UPDATE Humanoids SET firstName = (SELECT NULLIF(?, '')), lastName = (SELECT NULLIF(?, '')), gameID = ?, class = (SELECT NULLIF(?, '')), hitpointVal = ? WHERE humanoidID = ?";
  // console.log("humid is:", req.body.humid);
  var inserts = [req.body.firstname, req.body.lastname, req.body.gameName, req.body.class, req.body.hitpoints, req.body.humid];
  sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    if(error){
	if(error.sqlMessage == "Column 'firstName' cannot be null" || error.sqlMessage == "Column 'lastName' cannot be null" || error.sqlMessage == "Column 'class' cannot be null"){
		res.redirect('/Players/charSheet/' + req.body.humid);
	}
	else{
      		console.log(JSON.stringify(error));
      		res.write(JSON.stringify(error));
      		res.end();
	}
    }
    else{
      res.redirect('/Players/charSheet/' + req.body.humid);
    }
  });
});

app.post('/Players/addItem', function(req, res){
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO ItemsHumanoids (itemID, humanoidID) VALUES ((SELECT itemID FROM Items WHERE name = ? LIMIT 1),?)";
  var inserts = [req.body.itemName, req.body.humid];
  sql = mysql.pool.query(sql, inserts, function(error, results, fields){
    if(error){
      if(error.code == "ER_DUP_ENTRY"){
        res.redirect('/Players/charSheet/' + req.body.humid);
      }
      else{
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      }
    }
    else{
      res.redirect('/Players/charSheet/' + req.body.humid);
    }
  });
});

app.post('/Items', function(req, res){
  // console.log(req.body);
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO Items (name, effect, type, cost) VALUES ((SELECT NULLIF(?, '')),?,(SELECT NULLIF(?, '')),?)";
  var insert = [req.body.itemName, req.body.itemEffect, req.body.itemType, req.body.itemCost];
  sql = mysql.pool.query(sql, insert, function(error, results, fields){
    if(error){
      if(error.sqlMessage == "Column 'name' cannot be null" || error.sqlMessage == "Column 'type' cannot be null"){
        res.redirect('/Items');
      }
      else{
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      }
    }
    else{
      res.redirect('/Items');
    }
  });
});


app.use(function(req,res){
   res.status(404);
   res.render('404');
});

app.use(function(err, req, res, next){
   res.type('plain/text');
   res.status(500);
   res.render('500');
});

app.listen(app.get('port'), function(){
   console.log('Epress started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
