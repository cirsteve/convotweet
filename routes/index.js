var fs = require('fs').fs;

exports.index = function(req, res){
  res.render('index.jade', { title: 'Twitter Visualization Dashboard' });
};
