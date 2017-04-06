var app = require("../src/main.js");
var supertest = require("supertest")(app);
var assert = require('assert');

describe('tests /ts/query', function() {

    var ts = Date.now();
    var data = {
	    	"data": {test:"data", hello:"world"},
		};
    
    for(let i=0; i<10; i++) {
        it("Adds records posted to :datasourceid/ts", function(done) { 
            data.timestamp = ts + i;
            supertest
                .post("/"+11+"/ts/")
                .send(data)
                .expect(200)
                .end(function(err,result){
                    assert.deepEqual(result.body.data, {test:"data", hello:"world"});
                    done();
                });
        });
    }

    it("Adds index :datasourceid/ts/index", function(done) { 
        supertest
                .get("/"+11+"/ts/index")
                .send({index:'data.test'})
                .expect(200)
                .end(function(err,result){
                    done();
                });
    });

    it("gets docs from query :datasourceid/ts/query", function(done) { 
        supertest
                .get("/"+11+"/ts/query")
                .send({query: JSON.stringify({ 'data.test': 'data' })})
                .expect(200)
                .end(function(err,result){
                    assert.equal(true, result.body.length >= 10);
                    done();
                });
    });

    it("gets docs from query with limit :datasourceid/ts/query", function(done) { 
        supertest
                .get("/"+11+"/ts/query")
                .send({query: JSON.stringify({ 'data.test': 'data' }), limit:5})
                .expect(200)
                .end(function(err,result){
                    assert.equal(true, result.body.length == 5);
                    done();
                });
    });

    it("gets docs from query with limit and sort :datasourceid/ts/query", function(done) { 
        supertest
                .get("/"+11+"/ts/query")
                .send(
                      { 
                        query: JSON.stringify({ 'data.test': 'data' }), 
                        limit:5, 
                        sort:JSON.stringify({'timestamp':-1})
                      }
                     )
                .expect(200)
                .end(function(err,result){
                    assert.equal(true, result.body.length == 5);
                    done();
                });
    });



});