var express = require("express");

var bodyParser = require("body-parser");

var path = require("path");

var exphbs = require("express-handlebars");

var mongoose = require("mongoose");

var configurePassport = require("./app/passport/configurePassport");

var port = process.env.PORT || 3000;

var app = express();

mongoose.connect(process.env.MONGOLAB_URL);

var passport = require("passport");

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "/app/public")));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());

app.use(passport.session());

configurePassport(passport);

var api = require("./app/routes/api");

var index = require("./app/routes/index");

index(app,passport);

app.use("/api", api);

app.listen(port, function() {
	console.log("Server is listening on "+port);
})