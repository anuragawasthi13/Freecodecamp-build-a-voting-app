var mongoose = require("mongoose");

var User_Schema = new mongoose.Schema({
	
	twitter: {
		id:String,
		token:String,
		username:String,
		displayName:String
	},
	votes: []

});

var User = module.exports =  mongoose.model("User", User_Schema);