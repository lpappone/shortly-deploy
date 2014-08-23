var app = require('./server-config.js');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/shortly');

var port = process.env.PORT || 4568;

app.listen(port);

console.log('Server now listening on port ' + port);
