var express = require("express");
var bodyParser = require("body-parser");
var databox_directory = require("./utils/databox_directory.js");

var timeseriesRouter = require('./timeseries.js');
var keyValueRouter = require('./keyvalue.js');
var actuateRouter = require('./actuate.js');
var macaroonVerifier = require('./macaroon-verifier.js');

var DATABOX_LOCAL_NAME = process.env.DATABOX_LOCAL_NAME;
// TODO: Refactor token to key here and in CM to avoid confusion with bearer tokens
var ARBITER_KEY = process.env.ARBITER_TOKEN;
var NO_SECURITY = !!process.env.NO_SECURITY;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/status', function(req, res) {
	res.send('active');
});

macaroonVerifier.getSecretFromArbiter(ARBITER_KEY)

	.then((secret) => {
		// TODO: Clean up

		if (!NO_SECURITY)
			app.use(macaroonVerifier.verifier(secret, DATABOX_LOCAL_NAME));

		app.use('/api/actuate',actuateRouter(app));

		app.use('/:var(api/data|api/ts)?',timeseriesRouter(app));

		app.use('/api/key',keyValueRouter(app));

		//return databox_directory.register_datastore(DATABOX_LOCAL_NAME, ':8080/api');
	})

	.then((ids) => {
		//Websocket connection to live stream data
		var server = require('http').createServer(app);
		var WebSocketServer = require('ws').Server;
		app.wss = new WebSocketServer({ server: server });
		app.broadcastDataOverWebSocket = require('./broadcastDataOverWebSocket.js')(app);

		server.listen(8080);
	})

	.catch((err) => {
		console.log(err);
	});
