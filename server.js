var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var db = require('./config/connection.js');

// Initialize Express
var app = express();

// Logger
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Express settings
app.use(express.static("public"));

// Express handlebars
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');


// Routes
// ======
var routes = require('./controller/routes.js');
var PORT = 3000;

app.use('/', routes);

// Listen on port PORT
app.listen(PORT, function() {
  console.log("App running on port: " + PORT);
});
