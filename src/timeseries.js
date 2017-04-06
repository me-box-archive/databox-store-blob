/*jshint esversion: 6 */
const Router = require('express').Router;
const Datastore = require('nedb');

const db = new Datastore({filename: '../database/datastore.db', autoload: true});
db.ensureIndex({fieldName: 'datasource_id', unique: false});
db.ensureIndex({fieldName: 'timestamp', unique: false});

// TODO: Consider OOP-ing this whole thing

module.exports.api = function (subscriptionManager) {
	let router = Router({mergeParams: true});

	const latest = function (req, res, next) {
		const datasource_id = req.params.datasourceid;
		db.find({ datasource_id: datasource_id }).sort({ timestamp: -1 }).limit(1).exec(function (err, doc) {
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
		db.find({ datasource_id, $where: function () { return this.timestamp >= timestamp; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
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

		db.find({ datasource_id, $where: function () { return this.timestamp >= start && this.timestamp <= end; } }).sort({ timestamp: 1 }).exec(function (err, doc) {
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
		db.ensureIndex({ fieldName: indexName }, function (err) {
			if (err) {
				console.log('[Error]::', req.originalUrl, timestamp);
				res.status(400).send(err);
				return;
			}
			res.send();
		});
	};

	const query = function (req, res, next) {
		try{
			const query = JSON.parse(req.body.query);
			const limit = req.body.limit || -1;
			const sort = JSON.parse(req.body.sort || '{}');
			console.log(query);
			db.find(query).sort(sort).limit(limit).exec(function (err,docs) {
				if (err) {
					console.log('[Error]::', req.originalUrl, timestamp);
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
		if(req.body.timestamp && Number.isInteger(req.body.timestamp)) {
			timestamp = req.body.timestamp;
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
			res.send(doc);
		});

		console.log("New data written subscriptionManager.emit:",req.params.datasourceid + '/ts', data);
		subscriptionManager.emit('/' + req.params.datasourceid + '/ts', data);
	});

	return router;
};
