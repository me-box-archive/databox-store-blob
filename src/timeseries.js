/*jshint esversion: 6 */
const Router = require('express').Router;

const MongoClient = require('mongodb').MongoClient;
let db = null;
MongoClient.connect("mongodb://localhost:27017/db", function(err, mongo) {
  if(!err) {
    console.log("We are connected");
	mongo.collection('timesseries', function(err, collection) {
		if(!err) {
			console.log("Timeseries collection created");
			collection.createIndex( { "datasource_id": 1 }, { unique: false } );
			collection.createIndex( { "timestamp": 1 }, { unique: false } );
			db = collection;
		}
	});
  } else {
	  console.log("[ERROR] can't connect to mongo");
  }
});

module.exports.api = function (subscriptionManager) {
	let router = Router({mergeParams: true});

	const latest = function (req, res, next) {
		const datasource_id = req.params.datasourceid;
		db.find({ datasource_id: datasource_id }).limit(1).sort({ timestamp: -1 }).toArray(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl);
				// TODO: Status code + document
				res.status(400).send(err);
				return
			}
			res.send(doc);
		});
	};

	const since = function (req, res, next) {
		const datasource_id = req.params.datasourceid;
		const timestamp = req.body.startTimestamp;
		console.log("SINCE", datasource_id, timestamp);
		db.find({ 'datasource_id': datasource_id, 'timestamp':{$gte:timestamp} }).sort({ 'timestamp': 1 }).toArray(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.status(400).send(err);
				return;
			}
			res.send(doc);
		});
	};

	const range = function (req, res, next) {
		const datasource_id = req.params.datasourceid;
		const start = req.body.startTimestamp;
		const end = req.body.endTimestamp;

		db.find({ 'datasource_id': datasource_id, 'timestamp':{$gte:start, $lte:end}}).sort({ timestamp: 1 }).toArray(function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				// TODO: Status code + document
				res.status(400).send(err);
				return;
			}
			res.send(doc);
		});
	};

	const index = function (req, res, next) {
		const indexName = req.body.index;
		let options = {};
		options[indexName] = 1;
		db.createIndex(options, function (err) {
			if (err) {
				console.log('[Error]::', err);
				res.status(400).send(err);
				return;
			}
			res.send();
		});
	};

	const query = function (req, res, next) {
		try{
			const query = JSON.parse(req.body.query);
			const limit = req.body.limit || 0;
			const sort = JSON.parse(req.body.sort || '{}');
			console.log(query);
			db.find(query).sort(sort).limit(limit).toArray(function (err,docs) {
				if (err) {
					console.log('[Error]::', err);
					res.status(400).send(err);
					return;
				}
				res.send(docs);
			});
		} catch (e) {
			console.log('[Error]:: bad query',e);
			res.status(400).send('[Error]:: bad query');
		}
	};

	router.get('/', function (req, res, next) {

		var cmd = req.params.cmd;
		if(cmd == 'latest') {
			latest(req, res, next);
		}
		if(cmd == 'since') {
			since(req, res, next);
		}
		if(cmd == 'range') {
			range(req, res, next);
		}
		if(cmd == 'index') {
			index(req, res, next);
		}
		if(cmd == 'query') {
			query(req, res, next);
		}
		
	});

	// TODO: .all, see #15
	router.post('/', function (req, res, next) {
		
		//trust the drivers timestamp
		let timestamp = null;
		if(req.body.data.timestamp && Number.isInteger(req.body.data.timestamp)) {
			timestamp = req.body.data.timestamp;
		} else {
			timestamp = Date.now();
		}
		
		var data = {
			datasource_id: req.params.datasourceid,
			'data': req.body.data,
			'timestamp': timestamp
		};

		db.insert(data, function (err, doc) {
			if (err) {
				console.log('[Error]::', req.originalUrl, data, err);
				// TODO: Status code + document
				res.status(400).send(err);
				return;
			}
			res.send(doc.ops[0]);
		});
		subscriptionManager.emit('/' + req.params.datasourceid + '/ts', data);
	});

	return router;
};
