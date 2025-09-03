const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);



suite('Functional Tests', function() {
    let id1, id2;
    let deletedID;
    let invalidID = '64a66f4f531f5b001c3e8b99';
  suite('POST /api/issues/{project}', function() {
    //1 Create an issue with every field
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA',
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by, 'Functional Test - Every field');
            assert.equal(res.body.assigned_to, 'Chai and Mocha');
            assert.equal(res.body.status_text, 'In QA');
            assert.isTrue(res.body.open);
            assert.property(res.body, '_id');
            id1 = res.body._id;
            done();
        })
    })
    //2 Create an issue with only required fields
    test('Creat an issue with only the required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
            issue_title: 'Title 2',
            issue_text: 'text 2',
            created_by: 'Functional Test - Required fields',
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title 2');
            assert.equal(res.body.issue_text, 'text 2');
            assert.equal(res.body.created_by, 'Functional Test - Required fields');
            id2 = res.body._id;
            done();
        })
    })
    //3 Create an issue with missing required fields
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
            issue_title: 'Title 3',
            issue_text: 'text 3'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
        })
    })
  })

  suite('GET /api/issues/{project}', function() {
    //4 View issues on a project
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
        })
    })
    //5 View issues on a project with one filter
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ _id: id1 })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 1);
            assert.equal(res.body[0]._id, id1);
            done();
        })
    })
    //6 View issues on a project with multiple filters
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ _id: id2, issue_text: 'text 2' })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 1);
            assert.equal(res.body[0]._id, id2);
            done();
        })
    })
  })

  suite('PUT /api/issues/{project}', function() {
    //7 Update one field on an issue
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
            _id: id1,
            issue_text: 'Updated text'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, id1);
            done();
        })
    })
    //8 Update multiple fields on an issue
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
            _id: id2,
            issue_text: 'Updated text 2',
            assigned_to: 'New Assignee'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, id2);
            done();
        })
    })
    //9 Update an issue with missing ID
    test('Update an issue with missing ID: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
            issue_text: 'Updated text 2',
            assigned_to: 'New Assignee'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Missing ID');
            done();
        })
    })
    //10 Update an issue with no fields to update
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
            _id: id1
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'No update field(s) sent');
            done();
        })
    })
    //11 Update an issue with an invalid ID
    test('Update an issue with an invalid ID: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({ 
            _id: invalidID,
            issue_text: 'Updated text'
        })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Could not update');

            done();
        })
    })
  })

  suite('DELETE /api/issues/{project}', function() {
    //12 Delete an issue
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: id1 })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, `deleted ${id1}`);
            deletedID = id1;
            done();
        })
    })
    //13 Delete an issue with an invalid _id
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: invalidID })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Invalid ID');
            done();
        })
    })
    //14 Delete an issue with missing _id
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({ })
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Missing ID');
            done();
        })
    })
  })
});