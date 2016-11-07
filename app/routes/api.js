var express = require("express");

var router = express.Router();

var Poll = require("../models/Poll");

var User = require("../models/User");

var puid = require("puid");

router.get("/", function(req, res) {
	res.status(200).json({
		"ok": 1
	})
});

router.post('/createpoll', function(req, res) {
	console.log(req.body);
	var newPoll = new Poll();
	newPoll.pollId = new puid().generate();
	newPoll.title = req.body.title;
	newPoll.options = req.body.options;
	newPoll.author = req.user.twitter.id;
	newPoll.options = [];
	for (var i = 0; i < req.body.options.length; i++) {
		newPoll.options.push({
			text: req.body.options[i].text,
			optionId: new puid().generate(),
			votes: 0
		})
	}
	newPoll.save((err) => {
		if (err)
			throw err;

		console.log("new poll created", newPoll);
		res.status(200).json({
			"ok": 1
		})
	})
});

router.get("/polls", function(req, res) {
	Poll.find({}, {
		__v: 0,
		_id: 0
	}, function(err, data) {
		if (err)
			throw err;
		res.status(200).json(data);
	});
});

router.get("/mypolls", function(req, res) {
	var userId = "";
	if (req.user) {
		userId = req.user.twitter.id;
	}
	console.log(userId);
	Poll.find({
		author: userId
	}, {
		_id: 0,
		__v: 0
	}).exec(function(err, data) {
		if (err)
			throw err;
		res.status(200).json(data);
	})
});

router.post("/vote", function(req, res) {
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
	User.findOne({
		'twitter.id': userId
	}).exec(function(err, user) {
		if (err)
			throw err;
		if (user) {
			console.log("user found",user);
			console.log("incrementing poll votes");
			
			var previouslyVotedFor;
			var found = 0;
			for (var i = 0; i < user.votes.length; i++) {
				if (user.votes[i].pollId == req.body.pollId) {
					previouslyVotedFor = user.votes[i].optionId;
					user.votes[i].optionId = req.body.optionId;
					found = 1;
					break;
				}
			}
			Poll.findOne({
				pollId: req.body.pollId
			}).exec(function(err, poll) {
				if (err)
					throw err;
				for (var i = 0; i < poll.options.length; i++) {
					if (poll.options[i].optionId == req.body.optionId) {
						poll.options[i].votes += 1;
						break;
					}
				}
				if(found==1){
				for (var i = 0; i < poll.options.length; i++) {
						if (poll.options[i].optionId == previouslyVotedFor) {
							console.log("decreasing vote for previouslyVotedFor");
							poll.options[i].votes -= 1;
							break;
						}
					}
				}
				poll.markModified('options')
				poll.save();
			});
			if (found == 0) {

				user.votes.push({
					pollId: req.body.pollId,
					optionId: req.body.optionId
				});
			}
			user.markModified('votes');
			user.save();
			res.status(200).json({
				"ok": 1
			})
		} else {
			var newUser = new User();
			newUser.twitter.id = userId;
			newUser.votes = [{
				pollId: req.body.pollId,
				optionId: req.body.optionId
			}];
			newUser.save();
			Poll.findOne({
				pollId: req.body.pollId
			}).exec(function(err, poll) {
				if (err)
					throw err;
				for (var i = 0; i < poll.options.length; i++) {
					if (poll.options[i].optionId == req.body.optionId) {
						poll.options[i].votes += 1;
						break;
					}
				}
				poll.markModified('options')
				poll.save();
				res.status(200).json({
					"ok": 1
				})
			})
		}
	})
});

router.post("/addoption", function(req, res) {
	console.log(req.body);
	Poll.findOne({
		pollId:req.body.pollId
	}, function(err, data) {
		if (err)
			throw err;
		data.options.push({
			optionId: new puid().generate(),
			text: req.body.optionText,
			votes:0
		})
		data.markModified('options');
		data.save((err)=>{
			if(err)
				throw err;
			res.status(200).json({
				"ok": 1
			})
		})
	});
});

router.post("/deletepoll", function(req, res){
	Poll.findOne({
		pollId: req.body.pollId
	}).remove().exec(function(err,data){
		if(err)
			throw err;
		res.status(200).json({
			"ok":1
		})
	})
})

router.post("/poll", function(req,res){
	Poll.findOne({
		pollId: req.body.pollId
	}).exec(function(err, poll){
		if(err)
			throw err;
		res.status(200).json(poll);
	})
})


module.exports = router;