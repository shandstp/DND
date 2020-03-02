var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('views/images'));

app.engine('handlebars', handlebars.engine);
app.set('mysql', mysql)
app.set('view engine', 'handlebars');
app.set('port', 7017);

var context = {};

function getGames(res, mysql, context, complete){
  mysql.pool.query("SELECT gameID AS id, name FROM Games", function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.Game = results;
    complete();
  });
}

function getPlayers(res, mysql, context, complete){
  mysql.pool.query("SELECT firstName, lastName, playableChar AS playable, Games.name AS game, class, SpouseId, hitpointVal, humanoidID FROM Humanoids INNER JOIN Games On Humanoids.gameID = Games.gameID", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.player = result;
    // console.log(result);
    complete();
  });
}

function getDMs(res, mysql, context, complete){
  mysql.pool.query("SELECT firstName, lastName, experience, Games.name AS gameName, playerNum, email, DMID FROM DungeonMasters LEFT JOIN Games ON DMID = dungeonMasterID", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.DM = result;
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
    // console.log(result);
    complete();
  });
}

app.get('/', function(req,res){
   var context = {};
   res.render('home', context);
   return;
});

app.get('/Players', function(req,res){
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

app.post('/Players', function(req, res){
  console.log("test output");
  // console.log(req.body.gameName);
  console.log(req.body);
  var mysql = req.app.get('mysql');
  var sql = "INSERT INTO Humanoids (firstName, lastName, playableChar, gameID, class, hitpointVal) VALUES (?,?,1,?,?,20)";
  var inserts = [req.body.firstname, req.body.lastname, req.body.gameName, req.body.class];
  sql = mysql.pool.query(sql,inserts,function(error,results,fields){
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

app.use('/DungeonMasters', function(req,res){
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

app.get('/charSheet', function(req,res){
  var context = {};
  res.render('charSheet', context);
  return;
});

app.use('/Items', function(req, res){
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
