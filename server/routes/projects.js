const express = require('express');
const router = express.Router();
const { Project } = require('../models');
const { protect } = require('../middleware/auth');

function hasValidProjectUrls(body) {
  return ['githubUrl', 'liveUrl'].every(field => {
    const value = body[field];
    if (!value) return true;
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  });
}

router.route('/')
  .get(async (req, res) => {
    try {
      const projects = await Project.find().sort('order');
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  })
  .post(protect, async (req, res) => {
    try {
      if (!req.body.title) {
        return res.status(400).json({ success: false, message: 'Project title is required' });
      }
      if (!hasValidProjectUrls(req.body)) {
        return res.status(400).json({ success: false, message: 'Project links must be valid HTTP or HTTPS URLs' });
      }
      const project = await Project.create(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to create project' });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch project' });
    }
  })
  .put(protect, async (req, res) => {
    try {
      if (!hasValidProjectUrls(req.body)) {
        return res.status(400).json({ success: false, message: 'Project links must be valid HTTP or HTTPS URLs' });
      }
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to update project' });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
  });

module.exports = router;
