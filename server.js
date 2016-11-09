var express = require('express');
var mongodb = require('mongodb');
var app = express();
app.set('port', (process.env.PORT || 5000));
var MongoClient = mongodb.MongoClient;

//(Focus on This Variable)
// var url = 'mongodb://kseniya292:Anas5Url@ds141937.mlab.com:41937/urlshortner'; //change to local 
var localURL = "mongodb://root:password@localhost:27017/urlshortnerLOCALDB"  ;   
app.set('MONGO_URL', (process.env.MONGO || localURL))
//(Focus on This Variable)

function idShortner() {
		var shortenedToken = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
	return shortenedToken;
} //id shortner function 

app.get('/', function (req, res) {
  res.send('hello')
}); //route to serve up the homepage (index.html)

app.get('/:parameter', function (req, res) {
	var passedUrl = req.params.parameter; 
	function getBaseUrl() {
		var baseUrl = req.protocol + '://' + req.get('host') + '/'; //gives you http://localhost:3000
		return baseUrl;
	} //get base url function

	function createShortUrl () {
		return getBaseUrl()	+ idShortner();
	}
	var short_url = createShortUrl();

	
	if ( passedUrl.length == 4 ) {
		// query database]
		var checkURL = getBaseUrl() + passedUrl;
		// console.log(checkURL);

		function gotData(err, data) {
			if (err) throw err;
			console.log(data.original_url);
			res.redirect('http://' + data.original_url);
			// return data.original_url;
	    }	
		queryDB(checkURL, gotData);

	} else {
		// create store original and short URL
			function storeShortUrl(passedUrl) {
			// Use connect method to connect to the Server
				MongoClient.connect(app.get('MONGO_URL'), function (err, db) {
				  if (err) {
				    console.log('Unable to connect to the mongoDB server. Error:', err);
				  } else {
				    console.log('Connection established to', app.get('MONGO_URL'));
				    // console.log(short_url);
				    db.collection('urlshortner').insert({"original_url" : passedUrl, "short_url" : short_url}, function (err, data) {
				    	if (err) throw err;
				    }); //db.collection

				    //Close connection
				    db.close();
				  }
				}); //mongoclient connect

				res.send({
					"original_url" : passedUrl,
					"short_url" : short_url
				});

			} //storeShortUrl function

			storeShortUrl(passedUrl);
	}

}); //app.get

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 3000!');
});


function queryDB (checkURL, gotData) {
		
	MongoClient.connect(app.get('MONGO_URL'), function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    console.log('Connection established to', app.get('MONGO_URL'));

	    db.collection('urlshortner').findOne({short_url : checkURL}, { original_url : 1, _id : 0}, gotData); //db colletions
	     
	    //Close connection
	    db.close();
	  } //if else statement
	}); //mongoclient connect

} //queryDB




