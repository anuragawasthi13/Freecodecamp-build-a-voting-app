console.log("node environment is", process.env.NODE_ENV);
if(process.env.NODE_ENV == "development"){
	module.exports = {
	"twitterAuth": {
		consumerKey:"0I92FQNhH8yOO78JhMJfKADFt",
		consumerSecret:"LelsK8KbA4erDCLwgiNZKHcTBYXOnPsWuSKyZ7sv5oOVKB8a0x",
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
		}
	}	
} else{
	module.exports = {
	"twitterAuth": {
		consumerKey:"IizN1Lt9Yg11k18GOvJPNq4Ej",
		consumerSecret:"EtS76vPoLr2PrMlLva3gHd2pEdGyXXuMqvOJLFdnBDHKf1k9d4",
		callbackURL: "https://morning-shelf-79437.herokuapp.com/auth/twitter/callback"
		}
	}
}
