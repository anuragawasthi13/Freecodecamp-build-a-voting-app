var Poll = require("../models/Poll");

var User = require("../models/User");

module.exports = function(app, passport) {
	app.get("/", function(req, res) {
		res.render('polls', {
			user: req.user
		});
	});

	app.get("/vote/:pollId", function(req, res) {
		var userId;
		if (req.user) {
			userId = req.user.twitter.id;
		} else {
			userId = req.headers['x-forwarded-for'] ||
				req.connection.remoteAddress ||
				req.socket.remoteAddress ||
				req.connection.socket.remoteAddress;
			userId = userId.toString();
		}
		Poll.findOne({
			pollId: req.params.pollId
		}, {
			__v: 0,
			_id: 0
		}).exec(function(err, data) {
			if (err)
				throw err;
			
			User.findOne({
				"twitter.id": userId
			}, {
				_id: 0,
				__v: 0
			}).exec(function(err, user) {
				if (err)
					throw err;
				var option = null;
				if (user) {
					for (var i = 0; i < user.votes.length; i++) {
						if (user.votes[i].pollId == req.params.pollId) {
							option = user.votes[i];
							break;
						}
					}
				}
				console.log("userVotedFor", option);
				res.render('vote', {
					user: req.user,
					poll: data,
					userVotedFor: option,
					pollOptionsLength: data.options.length==0?false:true
				});
			})

		})

	});

	app.get('/auth/twitter', passport.authenticate('twitter'));

	// handle the callback after twitter has authenticated the user
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.redirect('/');
	}

	app.get("/logout", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	app.get("/createpoll", isLoggedIn, function(req, res) {
		res.render("createpoll", {
			user: req.user
		});
	});

	app.get("/yourpolls", isLoggedIn, function(req, res) {
		res.render("yourpolls", {
			user: req.user
		});
	})

}