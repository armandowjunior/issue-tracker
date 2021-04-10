const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(require("chai-datetime"));
chai.use(chaiHttp);

let deleteID;

suite("Functional Tests", function () {
  suite("POST REQUESTS", function () {
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/tests")
        .set("content-type", "application/json")
        .send({
          issue_title: "Testing",
          issue_text: "Test Text",
          created_by: "Test Person",
          assigned_to: "Test Person",
          status_text: "Testing",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          deleteID = res.body._id;
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

    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/tests")
        .set("content-type", "application/json")
        .send({
          issue_title: "Testing",
          issue_text: "Test Text",
          created_by: "Test Person",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Testing");
          assert.equal(res.body.issue_text, "Test Text");
          assert.equal(res.body.created_by, "Test Person");
          assert.equal(res.body.assigned_to, "");
          assert.closeToTime(new Date(res.body.created_on), new Date(), 60);
          assert.closeToTime(new Date(res.body.updated_on), new Date(), 60);
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "");
          done();
        });
    });

    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/tests")
        .set("content-type", "application/json")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: "",
          assigned_to: "",
          status_text: "",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET REQUESTS", function () {
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test-data")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 4);
          done();
        });
    });

    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test-data")
        .query({ _id: "607115d49d99202ed81c5746" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id: "607115d49d99202ed81c5746",
            issue_title: "123",
            issue_text: "123",
            created_on: "2021-04-10T03:04:52.000Z",
            updated_on: "2021-04-10T03:04:52.000Z",
            created_by: "123",
            assigned_to: "123",
            open: true,
            status_text: "123",
          });
          done();
        });
    });

    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/test-data")
        .query({ _id: "607115d49d99202ed81c5746", issue_text: "123" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id: "607115d49d99202ed81c5746",
            issue_title: "123",
            issue_text: "123",
            created_on: "2021-04-10T03:04:52.000Z",
            updated_on: "2021-04-10T03:04:52.000Z",
            created_by: "123",
            assigned_to: "123",
            open: true,
            status_text: "123",
          });
          done();
        });
    });
  });

  suite("PUT REQUESTS", function () {
    test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test-data-put")
        .send({
          _id: "60711d2dbb20c00fac1c665b",
          issue_title: "Updated Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "60711d2dbb20c00fac1c665b");
          done();
        });
    });

    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test-data-put")
        .send({
          _id: "60711d2dbb20c00fac1c665b",
          issue_title: "Updated Title",
          issue_text: "Updated Text",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, "60711d2dbb20c00fac1c665b");
          done();
        });
    });

    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test-data-put")
        .send({
          issue_title: "Updated Title",
          issue_text: "Updated Text",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test-data-put")
        .send({
          _id: "60711d2dbb20c00fac1c665b",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });

    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test-data-put")
        .send({
          _id: "60711d2dbb20c00fac1c665d",
          issue_title: "Updated Title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          done();
        });
    });
  });

  suite("PUT REQUESTS", function () {
    test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/tests")
        .send({
          _id: deleteID,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
    });

    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/tests")
        .send({
          _id: "60711d2dbb20c00fac1c668f",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          done();
        });
    });

    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/tests")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
