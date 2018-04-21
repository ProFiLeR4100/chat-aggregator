let express = require('express');
let config = require('./config');
let socketServer = require('./be-server/init')(config);

var app = express();

app.use(express.static('fe-server/build')).listen(config.httpPort);