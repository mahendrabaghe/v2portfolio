const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization: { type: String },
  issueDate: { type: String },
  credentialUrl: { type: String },
  certificateImage: { type: String }
});




const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  university: { type: String, required: true },
  startYear: { type: String },
  endYear: { type: String },
  cgpa: { type: String },
  description: { type: String }
});




const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
  responsibilities: { type: [String] },
  technologies: { type: [String] },
  certificate: { type: String },
  order: { type: Number, default: 0 }
});




const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});





const ProfileSchema = new mongoose.Schema({
  name: { type: String },
  title: { type: String },
  description: { type: String },
  profileImage: { type: String },
  resumeFile: { type: String },
  aboutText: { type: [String] },
  cgpa: { type: String },
  projectsCount: { type: String },
  internshipsCount: { type: String },
  problemsSolved: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  github: { type: String },
  kaggle: { type: String },
  theme: { type: String, default: 'light' }
});




const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  technologies: { type: [String] },
  githubUrl: { type: String },
  liveUrl: { type: String },
  imageUrl: { type: String },
  order: { type: Number, default: 0 }
});




const SkillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  skills: [{
    name: { type: String },
    percentage: { type: Number }
  }],
  order: { type: Number, default: 0 }
});






const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};




module.exports = {
  mongoose,
  Certification: mongoose.model('Certification', CertificationSchema),
  Education: mongoose.model('Education', EducationSchema),
  Experience: mongoose.model('Experience', ExperienceSchema),
  Message: mongoose.model('Message', MessageSchema),
  Profile: mongoose.model('Profile', ProfileSchema),
  Project: mongoose.model('Project', ProjectSchema),
  Skill: mongoose.model('Skill', SkillSchema),
  User: mongoose.model('User', UserSchema),
};
