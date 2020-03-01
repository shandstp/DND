module.exports = function(){
  var express = require('express');
  var router = express.Router();

  function getPlayers(res, mysql, context, complete){
    mysql.pool.query("SELECT firstName, lastName, Games.name AS game, playableChar AS playable, class, hitpointVal AS 'hit  points' FROM Humanoids INNER JOIN Games On Humanoids.gameID = Games.gameID", function(error, result, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      context.players = result;
      complete();
    });
  }
















  return router;
}();
