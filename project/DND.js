var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.static('views/images'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 7017);

var context = {};

app.get('/', function(req,res){
   var context = {};
   res.render('home', context);
   return;
});

app.get('/Players', function(req,res){
   var context = {};
   res.render('players', context);
   return;
});

app.get('/DungeonMasters', function(req,res){
   var context = {};
   res.render('dms', context);
   return;
});

app.get('/Items', function(req, res){
  var context = {};
  res.render('dms', context);
  return;
})

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
