const Router = require('express').Router;

const MongoClient = require('mongodb').MongoClient;
let db = null;
MongoClient.connect("mongodb://localhost:27017/db", function(err, mongo) {
  if(!err) {
    console.log("We are connected");
	mongo.collection('KV', function(err, collection) {
		if(!err) {
			console.log("KV collection created");
			collection.createIndex( { "datasource_id": 1 }, { unique: false } );
			collection.createIndex( { "key": 1 }, { unique: true } );
			db = collection;
		}
	});
  } else {
	  console.log("[ERROR] can't connect to mongo");
  }
});

module.exports.api = function (subscriptionManager) {
	var router = Router({mergeParams: true});

	// TODO: .all, see #15
	router.get('/', (req, res) => {
		var key = req.params.key;

		db.findOne({ key }, function (err, document) {
			if (err) {
				console.log("[Error]::", req.originalUrl);
				// TODO: Document
				res.status(500).send({ status: 500, error: err });
				return;
			}

			if(document == null) {
				res.status(404).send({ status: 404, error: 'Document not found' });
				return;
			}
			console.log("GET::",document);
			res.send(document.data);
		});
	});

	// TODO: .all, see #15
	router.post('/', (req, res) => {
		var key = req.params.key;
		var data = req.body;
		var doc = {
			key: key,
			data: data
		};

		db.findOneAndUpdate({ key }, doc, { upsert: true, returnUpdatedDocs: true }, function (err, document) {
			if (err) {
				console.log("[Error]::", req.originalUrl, doc, err);
				// TODO: Document
				res.status(500).send({ status: 500, error: err });
				return;
			}
			console.log("POST::",document);
			res.send(data);
		});

		subscriptionManager.emit('/' + key + '/kv', {
			datasource_id: key,
			data: data,
		});
	});

	return router;
};
