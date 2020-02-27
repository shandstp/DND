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
app.set('port', 7701);

var context = {};

function getPlayers(res, mysql, context, complete){
  mysql.pool.query("SELECT firstName, lastName, Games.name AS game, playableChar AS playable, class, hitpointVal AS 'hit  points' FROM Humanoids INNER JOIN Games On Humanoids.gameID = Games.gameID", function(error, result, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    context.player = result;
    console.log(result);
    complete();
  });
}

app.get('/', function(req,res){
   var context = {};
   res.render('home', context);
   return;
});

app.use('/Players', function(req,res){
   var callbackCount = 0;
   console.log("hello");
   var context = {};
   console.log("there");
   var mysql = req.app.get('mysql');
   console.log("meh");
   getPlayers(res, mysql, context, complete);
   console.log("test");
   function complete(){
      callbackCount++;
         if(callbackCount >= 1){
            res.render('players', context);
         }

   }
   console.log("idunno");
   return;
});

app.get('/DungeonMasters', function(req,res){
   var context = {};
   res.render('dms', context);
   return;
});

app.get('/charSheet', function(req,res){
  var context = {};
  res.render('charSheet', context);
  return;
});

app.get('/Items', function(req, res){
  var context = {};
  res.render('items', context);
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
