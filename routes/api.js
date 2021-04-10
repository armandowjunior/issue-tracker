"use strict";
const myDB = require("../connection");
const ObjectID = require("mongodb").ObjectID;

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      // get request -> read the issues in the DB;
      let project = req.params.project;
      const query = req.query;

      if (query.open) {
        // if the prop exist in the query
        if (query.open === "true") query.open = true; // change the type from string to boolean
        if (query.open === "false") query.open = false;
      } else if (query._id) {
        query._id = ObjectID(query._id); // change the type from string to ObjectID;
      }

      myDB(async (client) => {
        const cursor = await client.db().collection(project).find(query);

        // Store the results in an array
        const issues = await cursor.toArray();

        res.json(issues);
      }).catch(console.error);
    })

    .post(function (req, res) {
      // post request -> create the issues in the DB;
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      // Check for errors - No required fields
      if (!issue_title || !issue_text || !created_by)
        return res.json({ error: "required field(s) missing" });

      myDB(async (client) => {
        const issue = await client
          .db()
          .collection(project)
          .insertOne({
            issue_title,
            issue_text,
            created_on: new Date(),
            updated_on: new Date(),
            created_by,
            assigned_to: assigned_to || "",
            open: true,
            status_text: status_text || "",
          });
        res.json(issue.ops[0]);
      }).catch(console.error);
    })

    .put(function (req, res) {
      // put request -> update the issue in the DB;
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      // Check for errors - Missing id
      if (!_id) return res.json({ error: "missing _id" });

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }

      myDB(async (client) => {
        const issue = await client
          .db()
          .collection(project)
          .updateOne(
            { _id: ObjectID(_id) }, // pass the object as type ObjectID to the DB, instead of string;
            {
              $set: {
                issue_title,
                issue_text,
                updated_on: new Date(),
                created_by,
                assigned_to,
                status_text,
                open: req.body.open ? false : true,
              },
            }
          );
        console.log(
          `${issue.matchedCount} document(s) matched the query criteria.`
        );
        console.log(`${issue.modifiedCount} document(s) was/were updated.`);

        if (issue.matchedCount === 0)
          return res.json({ error: "could not update", _id: _id });

        if (issue.modifiedCount > 0)
          return res.json({ result: "successfully updated", _id: _id });
      }).catch(console.error);
    })

    .delete(function (req, res) {
      // delete request -> delete the issue in the DB;
      let project = req.params.project;
      const { _id } = req.body;

      // Check for errors - Missing id
      if (!_id) return res.json({ error: "missing _id" });

      myDB(async (client) => {
        const issue = await client
          .db()
          .collection(project)
          .deleteOne({ _id: ObjectID(req.body._id) });
        console.log(`${issue.deletedCount} document(s) was/were deleted.`);

        if (issue.deletedCount === 0)
          return res.json({ error: "could not delete", _id: _id });

        // Return delete result
        if (issue.deletedCount > 0)
          return res.json({ result: "successfully deleted", _id: _id });
      }).catch(console.error);
    });
};
