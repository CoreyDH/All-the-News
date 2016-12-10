var mongoose = require("mongoose");
var Promise = require("bluebird");

mongoose.Promise = Promise;

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_swlpnwzv:2rj3bouff635ounce0krphmh59@ds129028.mlab.com:29028/heroku_swlpnwzv");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

module.exports = db;