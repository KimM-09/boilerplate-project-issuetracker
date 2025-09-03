'use strict';

require('dotenv').config()
const { save } = require('mongodb/lib/operations/collection_ops');
let mongoose = require('mongoose');

module.exports = function (app) {
 mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  const issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String,  default: '' },
    status_text: { type: String, default: '' },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    open: { type: Boolean, default: true }, 
    project: { type: String }
  })
  
  const Issue = mongoose.model('Issue', issueSchema);
  
  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      const filter = { ...req.query, project }
      try {
        const issues = await Issue.find(filter).exec();
        res.json(issues)
      } catch(err) {
        res.status(500).json({ error: 'Database Error'})
      }
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if(!issue_title || !issue_text || !created_by) {
         res.json({ error: 'required field(s) missing' });
         return;
      }

      try {
        //create a new issue
        const newIssue = new Issue({
          issue_title: issue_title, 
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          open: true, 
          project: project
        })
        //save the issue
        const savedIssue = await newIssue.save();
        res.json(savedIssue)
        
      }
      catch (err) {
        res.status(500).json({ error: 'Server error' })
      }
      
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if(!_id) {
       return res.json({ error: 'missing _id'})
        
      }
      if(!issue_title && !issue_text && !created_by && ! assigned_to && !status_text && open === undefined) {
       return res.json({error: 'no update field(s) sent', '_id': _id })
        
      }
      try {
        const issue = await Issue.findById(_id);
        if(!issue) {
         return res.json({error: 'could not update', '_id': _id })
          
        }
        if(issue_title) issue.issue_title = issue_title;
        if(issue_text) issue.issue_text = issue_text;
        if(created_by) issue.created_by = created_by;
        if(assigned_to) issue.assigned_to = assigned_to;
        if(status_text) issue.status_text = status_text;
        if(open !== undefined) issue.open = open;
        issue.updated_on = new Date()
        const updatedIssue = await issue.save();
        res.json({ result: 'successfully updated', '_id': _id  })
      } catch(err) {
        res.json({error: 'could not update', '_id': _id })
      }
      
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const { _id} = req.body;
      if(!_id){
        res.json({error: "missing _id"})
        return
      }
      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if(!deleted){
          res.json({error: 'could not delete', '_id': _id })
          return
        }
        res.json({ result: 'successfully deleted', '_id': _id })
      } catch (err) {
        res.json({error: 'could not delete', '_id': _id })
      }
    });
    
};
