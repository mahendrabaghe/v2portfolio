const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const dns = require('dns');
const path = require('path');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '.env') });

const requiredEnvironmentVariables = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(name => !process.env[name]);
if (missingEnvironmentVariables.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`);
}

const { User } = require('./models');
const { Profile } = require('./models');
const { Project } = require('./models');
const { Experience } = require('./models');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await User.deleteMany();
    await Profile.deleteMany();
    await Project.deleteMany();
    await Experience.deleteMany();

    const user = await User.create({ email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD });
    
    await Profile.create({
      name: 'Mahendra Baghel',
      title: 'AI • ML • Data Engineer',
      description: 'Final-year Computer Science Engineering student specializing in Artificial Intelligence, Machine Learning, Deep Learning and Data Analytics.',
      cgpa: '8.2',
      projectsCount: '4+',
      internshipsCount: '3+',
      problemsSolved: '30+',
      email: 'msb10102005@gmail.com'
    });

    await Project.create([
      { title: 'Real-Time Emotion Detection', category: 'dl', technologies: ['Python', 'TensorFlow'] },
      { title: 'Sign Language Translator', category: 'dl', technologies: ['Python', 'CNN'] }
    ]);

    await Experience.create([
      { company: 'Google for Developers', position: 'AI/ML Intern', startDate: 'Jul 2024', endDate: 'Sep 2024' }
    ]);

    console.log('Data seeded successfully. Admin login credentials are configured.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seed();
