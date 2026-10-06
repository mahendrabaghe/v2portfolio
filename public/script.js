// ================= MOBILE NAVBAR MENU =================
const menuIcon = document.getElementById('menuIcon');
const navbar = document.getElementById('navbar');

if (menuIcon && navbar) {
  menuIcon.addEventListener('click', () => {
    navbar.classList.toggle('active');
    menuIcon.textContent = navbar.classList.contains('active') ? '✕' : '☰';
  });
}

// ================= SMOOTH SCROLL & CLOSE MOBILE MENU =================
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function(e){
    // Close mobile menu when a link is clicked
    if (navbar && navbar.classList.contains('active')) {
      navbar.classList.remove('active');
      if (menuIcon) menuIcon.textContent = '☰';
    }

    // Check if link has hash (prevents JS from blocking the PDF download link)
    if(this.hash !== ""){
      e.preventDefault();
      const hash = this.hash;
      document.querySelector(hash).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});


// ================= PROFILE IMAGE POPUP =================
const profilePic = document.getElementById("profilePic");
const imagePopup = document.getElementById("imagePopup");
const popupImg = document.getElementById("popupImg");
const closeBtn = document.getElementById("closeBtn");

// Open Popup
profilePic.addEventListener("click", () => {
  imagePopup.style.display = "flex";
});

// Close Popup Button
closeBtn.addEventListener("click", () => {
  imagePopup.style.display = "none";
});

// Close Popup When Clicking Outside Image
imagePopup.addEventListener("click", (e) => {
  if(e.target !== popupImg){
    imagePopup.style.display = "none";
  }
});

// ================= NAVBAR ACTIVE LINK =================
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    const sectionHeight = section.clientHeight;
    if(pageYOffset >= sectionTop){
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(link => {
    link.classList.remove("active");
    if(link.getAttribute("href").includes(current)){
      link.classList.add("active");
    }
  });
});

// ================= HERO CARD ANIMATION =================
const heroCard = document.querySelector(".hero-card");

window.addEventListener("mousemove", (e) => {
  let x = (window.innerWidth / 2 - e.pageX) / 25;
  let y = (window.innerHeight / 2 - e.pageY) / 25;
  heroCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

// Reset Animation
window.addEventListener("mouseleave", () => {
  heroCard.style.transform = "rotateY(0deg) rotateX(0deg)";
});

// ================= SCROLL REVEAL ANIMATION =================
const revealElements = document.querySelectorAll(
  ".section, .project-card, .exp-card, .stat-card"
);

function revealOnScroll(){
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if(elementTop < windowHeight - 100){
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ================= CONSOLE MESSAGE =================
console.log("Portfolio Website Loaded Successfully 🚀");

// ================= HERO TYPING ANIMATION =================
const words = ["ML Engineer", "Data Scientist", "Data Analyst", ];
let wordIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typedTextEl = document.getElementById("typed-text");

function typeEffect() {
  if (!typedTextEl) return;
  const currentWord = words[wordIdx];
  
  if (isDeleting) {
    typedTextEl.textContent = currentWord.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typedTextEl.textContent = currentWord.substring(0, charIdx + 1);
    charIdx++;
  }
  
  let typeSpeed = isDeleting ? 50 : 100;
  
  if (!isDeleting && charIdx === currentWord.length) {
    typeSpeed = 1500; // Pause at end of word
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    wordIdx = (wordIdx + 1) % words.length;
    typeSpeed = 500; // Pause before next word
  }
  
  setTimeout(typeEffect, typeSpeed);
}

document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
});

// ================= PROJECT FILTERS LOGIC =================
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    const filterValue = btn.getAttribute("data-filter");
    
    projectCards.forEach(card => {
      if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });
});

// ================= SIMULATED AI CHATBOT =================
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotContainer = document.getElementById("chatbotContainer");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");
const suggestBtns = document.querySelectorAll(".suggest-btn");

if (chatbotToggle) {
  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.toggle("active");
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener("click", () => {
    chatbotContainer.classList.remove("active");
  });
}

const chatBotResponses = {
  "projects": "Mahendra has built several impressive projects:\n\n1. <b>Real-Time Emotion Detection</b>: Facial emotion recognition from webcam feed using Python, TensorFlow, OpenCV, and CNN.\n2. <b>Sign Language Translator</b>: Real-time sign language translation using OpenCV & Deep Learning.\n3. <b>Sentiment Analysis</b>: NLP project using BERT transformers for text analysis.\n4. <b>Heart Disease Prediction</b>: Machine learning classification model.\n5. <b>Intelligent RPA Bot</b>: Automated ETL workflows using Alteryx & BluePrism.\n6. <b>My Portfolio</b>: Personal portfolio website using HTML, CSS, and JS (hosted on Netlify).",
  "skills": "Mahendra is skilled in:\n\n• <b>Languages</b>: Python, C, SQL\n• <b>AI/ML</b>: TensorFlow, OpenCV, Scikit-Learn, Deep Learning, NLP\n• <b>Databases & Tools</b>: MySQL, MongoDB, Alteryx, BluePrism RPA",
  "experience": "Mahendra has completed 3 internships and holds multiple certifications/mentorships:\n\n<b>Internships:</b>\n1. <b>AI/ML Intern</b> at Google for Developers India Edu Program (Jul - Sep 2024)\n2. <b>Data Analytics Intern</b> at Alteryx SparkED (Apr - Jun 2024)\n3. <b>Intelligent Automation Intern</b> at SS&C BluePrism (Sep - Nov 2023)\n\n<b>Certifications & Mentorships:</b>\n• <b>Develop NLP Solutions with Azure AI Services</b> (Jan 2024)\n• <b>Microsoft Certified: Azure Fundamentals</b> (Sep 2023)\n• <b>AI & ML Mentorship Program Completion</b> at Pregrad (Aug - Nov 2023)",
  "education": "Mahendra is pursuing a <b>Computer Science Engineering</b> degree specializing in AI & ML at <b>ITM University Gwalior</b>. He maintains an excellent CGPA of <b>8.2</b>.",
  "hello": "Hello! How can I help you today? Ask me about Mahendra's projects, experience, or skills!",
  "hi": "Hi there! Feel free to ask me anything about Mahendra's background, education, or skills.",
  "hey": "Hey! How can I help you today?",
  "contact": "You can reach Mahendra via email at <b>msb10102005@gmail.com</b>. Check out his LinkedIn, GitHub, and Kaggle links in the contact section below!",
  "resume": "You can download Mahendra's resume using the download buttons in the navigation bar or the Hero section!",
  "certificate": "You can download Mahendra's certificates (Google for Developers, Alteryx SparkED, SS&C BluePrism, Microsoft Azure Fundamentals, Azure NLP Solutions, and Pregrad AI/ML Mentorship) directly from the <b>Experience</b> section of the portfolio!"
};

function handleBotResponse(userMsg) {
  const typingBubble = document.createElement("div");
  typingBubble.className = "chat-message bot chat-bubble-typing";
  typingBubble.innerHTML = "<span></span><span></span><span></span>";
  chatbotMessages.appendChild(typingBubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  const cleanMsg = userMsg.toLowerCase().trim();
  let responseText = "I'm not sure about that, but Mahendra is skilled in AI/ML, NLP, Python, and Data Engineering! Try asking about his projects, skills, or experience.";

  if (cleanMsg.includes("project")) responseText = chatBotResponses.projects;
  else if (cleanMsg.includes("skill") || cleanMsg.includes("tech") || cleanMsg.includes("programming")) responseText = chatBotResponses.skills;
  else if (cleanMsg.includes("experience") || cleanMsg.includes("job") || cleanMsg.includes("work") || cleanMsg.includes("intern")) responseText = chatBotResponses.experience;
  else if (cleanMsg.includes("education") || cleanMsg.includes("college") || cleanMsg.includes("cgpa") || cleanMsg.includes("university")) responseText = chatBotResponses.education;
  else if (cleanMsg.includes("hello") || cleanMsg.includes("hi ") || cleanMsg.trim() === "hi" || cleanMsg.includes("hey")) responseText = chatBotResponses.hello;
  else if (cleanMsg.includes("contact") || cleanMsg.includes("email") || cleanMsg.includes("linkedin")) responseText = chatBotResponses.contact;
  else if (cleanMsg.includes("resume") || cleanMsg.includes("cv")) responseText = chatBotResponses.resume;
  else if (cleanMsg.includes("certificate") || cleanMsg.includes("certifiacte") || cleanMsg.includes("credential")) responseText = chatBotResponses.certificate;

  setTimeout(() => {
    typingBubble.remove();
    
    const botMsgDiv = document.createElement("div");
    botMsgDiv.className = "chat-message bot";
    botMsgDiv.innerHTML = responseText.replace(/\n/g, "<br>");
    chatbotMessages.appendChild(botMsgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }, 1000);
}

if (chatbotForm) {
  chatbotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = chatbotInput.value;
    if (!query.trim()) return;

    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "chat-message user";
    userMsgDiv.textContent = query;
    chatbotMessages.appendChild(userMsgDiv);
    chatbotInput.value = "";
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    handleBotResponse(query);
  });
}

suggestBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const query = btn.getAttribute("data-query");
    
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "chat-message user";
    userMsgDiv.textContent = query;
    chatbotMessages.appendChild(userMsgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    handleBotResponse(query);
  });
});

// ================= CONTACT FORM VALIDATION & SIMULATION =================
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formStatus.textContent = "Sending message...";
    formStatus.className = "form-status";
    
    setTimeout(() => {
      formStatus.textContent = "Message sent successfully! Mahendra will get back to you shortly. 🚀";
      formStatus.className = "form-status success";
      contactForm.reset();
    }, 1500);
  });
}

// ================= THEME TOGGLE =================
const themeToggleBtn = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
  document.body.setAttribute('data-theme', 'light');
}

if(themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.body.getAttribute('data-theme');
    if (theme === 'light') {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });
}

// ================= DYNAMIC DATA FETCHING =================
const API_BASE = window.API_BASE_URL || window.API_URL || 'https://YOUR-RENDER-SERVICE.onrender.com/api';

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`[Portfolio] Request to ${url} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Portfolio] Could not connect to ${url}: ${err.message}`);
    return null;
  }
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value, API_BASE);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

async function fetchPortfolioData() {
  try {
    // ---- Profile / About ----
    const profile = await safeFetchJson(`${API_BASE}/profile`);
    if (profile && profile.name) {
      const nameParts = profile.name.split(' ');
      document.querySelector('.hero h1').innerHTML = `${nameParts[0]} <br><span>${nameParts.slice(1).join(' ')}</span>`;
      document.querySelector('.tag').textContent = profile.title || 'AI • ML • Data Engineer';
      document.querySelector('.desc').textContent = profile.description || '';

      // About text
      const aboutText = document.getElementById('aboutText');
      if (aboutText) {
        if (profile.aboutText && profile.aboutText.length > 0) {
          aboutText.innerHTML = profile.aboutText.map(p => `<p>${p}</p>`).join('');
        } else if (profile.description) {
          aboutText.innerHTML = `<p>${profile.description}</p>`;
        }
      }

      // Stats
      const setEl = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      setEl('statCgpa', profile.cgpa);
      setEl('statProjects', profile.projectsCount);
      setEl('statInternships', profile.internshipsCount);
      setEl('statProblems', profile.problemsSolved);

      // Contact links
      const emailLink = document.getElementById('contactEmailLink');
      if (emailLink && profile.email) {
        emailLink.href = `mailto:${profile.email}`;
        emailLink.textContent = profile.email;
      }
      const setLink = (id, href) => {
        const el = document.getElementById(id);
        if (el && href) el.href = href;
      };
      setLink('contactLinkedin', profile.linkedin);
      setLink('contactGithub', profile.github);
      setLink('contactKaggle', profile.kaggle);
    }

    // ---- Experiences ----
    const experiences = await safeFetchJson(`${API_BASE}/experiences`);
    const expContainer = document.getElementById('experienceContainer');
    if (expContainer) {
      if (experiences && experiences.length > 0) {
        expContainer.innerHTML = experiences.map(e => `
          <div class="exp-card">
            <div class="exp-top">
              <h3>${e.company}</h3>
              <span>${e.startDate || ''}${e.endDate ? ' – ' + e.endDate : ''}</span>
            </div>
            <h4>${e.position}</h4>
            ${e.description ? `<p>${e.description}</p>` : ''}
            ${e.technologies && e.technologies.length ? `<p style="margin-top:8px;opacity:0.7;">${e.technologies.join(' • ')}</p>` : ''}
            ${e.certificate && safeExternalUrl(e.certificate) ? `<a class="exp-cert-btn" href="${safeExternalUrl(e.certificate)}" target="_blank" rel="noopener noreferrer">View Certificate</a>` : ''}
          </div>`).join('');
      } else {
        expContainer.innerHTML = `<p style="color:#999; text-align:center;">No experiences added yet.</p>`;
      }
    }

    // ---- Projects ----
    const projects = await safeFetchJson(`${API_BASE}/projects`);
    const projectGrid = document.getElementById('projectGrid');
    if (projectGrid && projects && projects.length > 0) {
      projectGrid.innerHTML = projects.map(p => {
        const githubUrl = safeExternalUrl(p.githubUrl);
        const liveUrl = safeExternalUrl(p.liveUrl);
        return `
          <div class="project-card" data-category="${p.category || 'other'}">
            <h3>${p.title}</h3>
            <p>${p.description || ''}</p>
            <span>${p.technologies ? p.technologies.join(' • ') : ''}</span>
            ${githubUrl || liveUrl ? `<div class="project-link-container">
              ${githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">GitHub</a>` : ''}
              ${liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo</a>` : ''}
            </div>` : ''}
          </div>`;
      }).join('');

      // Re-bind filter buttons after dynamic render
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filterValue = btn.getAttribute('data-filter');
          document.querySelectorAll('.project-card').forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
              card.classList.remove('hide');
            } else {
              card.classList.add('hide');
            }
          });
        });
      });
    }

    // ---- Skills ----
    const skills = await safeFetchJson(`${API_BASE}/skills`);
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
      if (skills && skills.length > 0) {
        skillsGrid.innerHTML = skills.map(s => `
          <div class="skills-card">
            <h3>${s.category}</h3>
            ${(s.skills || []).map(sk => `
              <div class="skill">
                <div class="skill-info"><p>${sk.name}</p><span>${sk.percentage}%</span></div>
                <div class="bar"><span style="width:${sk.percentage}%"></span></div>
              </div>`).join('')}
          </div>`).join('');
      } else {
        skillsGrid.innerHTML = `<p style="color:#999; text-align:center;">No skills added yet.</p>`;
      }
    }

  } catch (error) {
    console.error('Error fetching portfolio data:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchPortfolioData);
