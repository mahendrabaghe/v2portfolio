const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const router = express.Router();
const { Experience } = require('../models');
const { protect } = require('../middleware/auth');

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));
const certificatesDirectory = path.join(uploadRoot, 'experience-certificates');

const certificateUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(certificatesDirectory, { recursive: true }, error => callback(error, certificatesDirectory));
    },
    filename: (req, file, callback) => callback(null, `${randomUUID()}.pdf`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    callback(isPdf ? null : new Error('Certificate must be a PDF file.'), isPdf);
  }
});

function receiveCertificate(req, res, next) {
  certificateUpload.single('certificate')(req, res, error => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Certificate must be 10 MB or smaller.'
        : error.message;
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

async function removeUploadedFile(file) {
  if (!file) return;
  await unlinkFile(file.path);
}

async function unlinkFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to remove uploaded certificate:', error);
    }
  }
}

async function removeStoredCertificate(certificate) {
  const match = typeof certificate === 'string'
    && certificate.match(/^\/uploads\/experience-certificates\/([0-9a-f-]+\.pdf)$/i);
  if (match) await unlinkFile(path.join(certificatesDirectory, match[1]));
}

async function hasPdfSignature(file) {
  const handle = await fs.promises.open(file.path, 'r');
  try {
    const header = Buffer.alloc(5);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    return bytesRead === header.length && header.toString('ascii') === '%PDF-';
  } finally {
    await handle.close();
  }
}

function normalizeExperienceBody(body) {
  const experience = { ...body };
  if (typeof experience.technologies === 'string') {
    const technologies = JSON.parse(experience.technologies);
    if (!Array.isArray(technologies) || technologies.some(item => typeof item !== 'string')) {
      throw new Error('Technologies must be a JSON array of strings.');
    }
    experience.technologies = technologies;
  }
  return experience;
}

router.route('/')
  .get(async (req, res) => {
    try {
      const experiences = await Experience.find().sort('order');
      res.json(experiences);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch experiences' });
    }
  })
  .post(protect, receiveCertificate, async (req, res) => {
    try {
      if (req.file && !(await hasPdfSignature(req.file))) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ success: false, message: 'The uploaded file is not a valid PDF.' });
      }
      const data = normalizeExperienceBody(req.body);
      if (!data.company || !data.position) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ success: false, message: 'Company and position are required' });
      }
      if (req.file) data.certificate = `/uploads/experience-certificates/${req.file.filename}`;
      const experience = await Experience.create(data);
      res.status(201).json(experience);
    } catch (error) {
      await removeUploadedFile(req.file);
      console.error('Error creating experience:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to create experience' });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id);
      if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
      res.json(experience);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch experience' });
    }
  })
  .put(protect, receiveCertificate, async (req, res) => {
    try {
      if (req.file && !(await hasPdfSignature(req.file))) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ success: false, message: 'The uploaded file is not a valid PDF.' });
      }
      const experience = await Experience.findById(req.params.id);
      if (!experience) {
        await removeUploadedFile(req.file);
        return res.status(404).json({ success: false, message: 'Experience not found' });
      }
      const previousCertificate = experience.certificate;
      experience.set(normalizeExperienceBody(req.body));
      if (req.file) experience.certificate = `/uploads/experience-certificates/${req.file.filename}`;
      await experience.save();
      if (req.file) await removeStoredCertificate(previousCertificate);
      res.json(experience);
    } catch (error) {
      await removeUploadedFile(req.file);
      console.error('Error updating experience:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to update experience' });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const experience = await Experience.findByIdAndDelete(req.params.id);
      if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
      await removeStoredCertificate(experience.certificate);
      res.json({ success: true, message: 'Experience deleted' });
    } catch (error) {
      console.error('Error deleting experience:', error);
      res.status(500).json({ success: false, message: 'Failed to delete experience' });
    }
  });

module.exports = router;
