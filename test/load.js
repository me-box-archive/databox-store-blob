
//used to test mem usage with lots of records take 20s to run so commented out usually 

/*var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');

describe('tests load', function() {

    var ts = Date.now();
    var data = {
	    	"data": {test:"data", hello:"world",testing:[1,2,3,43,56,7,7,8]},
		};
    
    for(let i=0; i<10000; i++) {
        it("Adds records posted to :datasourceid/ts", function(done) { 
            data.timestamp = ts + i;
            supertest
                .post("/"+11+"/ts/")
                .send(data)
                .expect(200)
                .end(function(err,result){
                    assert.deepEqual(result.body.data, {test:"data", hello:"world",testing:[1,2,3,43,56,7,7,8]});
                    done();
                });
        });
    }
});*/