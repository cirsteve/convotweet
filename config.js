try{
  var options = require('./options.js');
} catch(e) { }

var express = require('express')
  , twit = require('ntwitter');

module.exports = function(app){
  app.configure(function(){
    this.use(express.cookieParser())
        .use(express.bodyParser())
        .set('public', __dirname + '/public')
        .enable('jsonp callback')
        .enable('error templates')
        .use(express.static(__dirname + '/public'))
        .set('twit', new twitter({
          consumer_key: process.env['TWITTER_CONSUMER_KEY'] || options.consumer_key,
          consumer_secret: process.env['TWITTER_CONSUMER_SECRET'] || options.consumer_secret,
          access_token_key: process.env['TWITTER_ACCESS_TOKEN_KEY'] || options.access_token_key,
          access_token_secret: process.env['TWITTER_ACCESS_TOKEN_SECRET'] || options.access_token_secret
        }));
  });
