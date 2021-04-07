const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(require("chai-datetime"));
chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Routing Tests", function () {
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/tests")
        .type("form")
        .send({
          issue_title: "Testing",
          issue_text: "Test Text",
          created_by: "Test Person",
          assigned_to: "Test Person",
          status_text: "Testing",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Testing");
          assert.equal(res.body.issue_text, "Test Text");
          assert.equal(res.body.created_by, "Test Person");
          assert.equal(res.body.assigned_to, "Test Person");
          assert.closeToTime(new Date(res.body.created_on), new Date(), 60);
          assert.closeToTime(new Date(res.body.updated_on), new Date(), 60);
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "Testing");
          done();
        });
    });
  });
});
