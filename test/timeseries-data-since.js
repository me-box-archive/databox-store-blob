var app = require("../src/main.js");
app.locals.debug = true;
var supertest = require("supertest")(app);
var assert = require('assert');


var recordSet = []; // store res from can POST /data/since to test /data/range
var lastRecord = {};

describe('tests /ts/since', function() {
	var data = {
	    	"data": {new:"data", since:"world"},
		}; 
	
	it("Adds records posted to :timestamp/ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
		}; 
		supertest
			.post("/"+11+"/ts/")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done()
			});
	});

	it('can get lastRecord',function(done){
		supertest
				.get("/"+11+'/ts/latest')
				.send(data)
				.expect(200)
				.end(function(err,result){
					if(err) {
						assert.fail("","",err);
						done();
					}
					assert.deepEqual(result.body[0].data, {test:"data", hello:"world"});
					lastRecord = result.body[0];
					console.log(lastRecord.timestamp);
					done();
				});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world"});
				done();
			});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world0"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world0"});
				done();
			});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world1"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world1"});
				done();
			});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world2"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world2"});
				done();
			});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world3"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world3"});
				done();
			});
	});

	it("Adds records posted to /ts", function(done) {
		var data = {
	    	"data": {test:"data", hello:"world4"},
		}; 
		supertest
			.post("/"+11+"/ts")
			.send(data)
			.expect(200)
			.end(function(err,result){
				assert.deepEqual(result.body.data, {test:"data", hello:"world4"});
					console.log("TOSH::",lastRecord.timestamp);

				done();
			});
	});


	it('can GET /ts/since with startTimestamp ' + lastRecord.timestamp  + ' and returns 6 items',function(done){
		supertest
				.get("/"+11+'/ts/since')
				.send({
					startTimestamp: lastRecord.timestamp
				})
				//.expect(200)
				.end(function(err,result){
					console.log("TOSH2::",lastRecord.timestamp);
					if(err) {
						assert.fail("","",err);
						done();
					}
					assert.equal(result.body.length, 7);
					recordSet = result.body;
					done();
				});
	});

});

/*describe('tests /read/ts/range', function() {
	
		it('can POST /read/ts/range and retrieve data ',function(done){
		
			var data = {
	    	"start": recordSet[1].timestamp,
	    	"end": recordSet[4].timestamp,
			}; 

			supertest
					.post("/read/ts/"+11+'/range')
					.send(data)
					.expect(200)
					.end(function(err,result){
						if(err) {
							assert.fail("","",err);
							done();
						}
						assert.equal(result.body.length, 4);
						recordSet = result.body;
						done();
					});
		});
});*/
