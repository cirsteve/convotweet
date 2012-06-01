
/**
 * Module dependencies.
 */

try{
  var options = require('./options.js');
} catch(e) { }

var express = require('express')
  , routes = require('./routes')
  , Twitter = require('ntwitter')
  , fs = require('fs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
 // app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
var html = fs.readFileSync('views/index.html', 'utf8');
app.get('/', function(req,res) {
    res.send(html);
});

var io = require("socket.io").listen(app);

app.listen(3000);

console.log(options);

io.sockets.on('connection', function (socket) {
    console.log('connection called');
    socket.on('hello-server', function() {
        console.log('wadup');
    });
    socket.on('getSearch', function(terms) {
        console.log('getSearch called');
        var twitter = new Twitter(options);
        twitter.search('to:'+terms.term+' until:2012-05-24', {include_entities:true, rpp:100}, function(err, tweets) {
            socket.emit('new-tweets',  tweets);
        });
        twitter.search('from:'+terms.term, {include_entities:true, rpp:100}, function(err, tweets) {
            socket.emit('new-tweets',  tweets);
        });
    });
});

console.log("Express server listening on port %d in %s mode", app.settings.env);
