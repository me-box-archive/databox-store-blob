var request = require('request');
var basicAuth = require('basic-auth');
var macaroons = require('macaroons.js');
var pathToRegexp = require('path-to-regexp');


/**
 * @return {Promise} A promise that resolves with a shared secret gotten from the arbiter
 */
module.exports.getSecretFromArbiter = function(arbiterKey) {
	return new Promise((resolve, reject) => {
		if (!arbiterKey) {
			resolve('');
			return;
		}

		// TODO: Could just make it port 80 arbiter-side since permissions don't matter in the container anyway...
		request('http://'+arbiterKey+'@arbiter:8080/store/secret', (error, response, body) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(new Buffer(body, 'base64'));
		});
	});
};


/**
 * @param {String} Arbiter shared secret key
 * @param {String} Store hostname
 * @return {Function} Macaroon verification middleware
 */
module.exports.verifier = function (secret, storeName) {

	/**
	 * Checks validity of the macaroon "path" caveat
	 * @param {String} path
	 * @param {String} caveat
	 * @return {Boolean} valid
	 */
	var isPathtValid = function () {
		var prefixRegex = /path = .*/;
		var prefixLen   = 'path = '.length;

		return function (caveat, path) {
			if (!prefixRegex.test(caveat))
				return false;

			// TODO: Catch potential JSON.parse exception
			return pathToRegexp(JSON.parse(caveat.substring(prefixLen).trim())).test(path);
		}
	}();

	/**
	 * Returns a verifier for a given path
	 * @param {String} path
	 * @return {Function} Path verifier
	 */
	var createPathVerifier = function (path) {
		return function (caveat) {
			return isPathValid(caveat, path);
		};
	};

	return function (req, res, next) {
		// TODO: Fail loudly if app is not using body-parser

		// Extract token as per Hypercat PAS 212 7.1 for uniformity
		var creds = basicAuth(req);
		var macaroon = req.get('X-Api-Key') || (creds && creds.name);

		if (!macaroon) {
			res.status(401).send('Missing API key/token');
			return;
		}

		//console.log("Macaroon serialized:", macaroon);

		// Parse and verify macaroon
		// TODO: Complain if there are issues deserializing it
		macaroon = macaroons.MacaroonsBuilder.deserialize(req.body.macaroon);

		//console.log("Macaroon deserialized:", macaroon.inspect());

		macaroon = new macaroons.MacaroonsVerifier(macaroon);

		// Verify "target" caveat
		macaroon.satisfyExact("target = " + storeName);

		macaroon.satisfyGeneral(createPathVerifier(req.path));

		// TODO: Verify granularity etc here (or potentially in tandem with driver)?

		if (!macaroon.isValid(secret)) {
			res.status(401).send('Invalid API key/token');
			return;
		}

		next();
	};
};
