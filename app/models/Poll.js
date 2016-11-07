var mongoose = require("mongoose");

var Poll_Schema = new mongoose.Schema({
	pollId:String,
	title:String,
	author: String,
	options: []

});

var Poll = module.exports =  mongoose.model("Poll", Poll_Schema);