# Production Deployment Guide: Portfolio & Admin Panel

This guide walks you through deploying your portfolio architecture into full production:
- **Frontend & Admin Panel:** Hosted on **GitHub Pages** (`https://mahendrabaghe.github.io/portfolio/`)
- **Backend API:** Hosted on **Render** as a Node.js Web Service (`https://YOUR-RENDER-SERVICE.onrender.com`)
- **Database:** Hosted on **MongoDB Atlas** (Cloud Database)

Once deployed, any updates made through the Admin Panel are saved directly to MongoDB Atlas and are immediately visible to visitors on any device, anywhere in the world, without keeping your local computer turned on.

---

## Architecture Overview

```text
Visitor / Admin Browser
       │
       ▼
GitHub Pages (Frontend HTML, CSS, JavaScript)
       │
       ▼ HTTPS API Calls (Bearer JWT Auth)
Render Web Service (Node.js + Express API)
       │
       ▼ Mongoose Driver (TLS Encrypted)
MongoDB Atlas (Cloud Cluster)
```

---

## Step 1: Configure MongoDB Atlas Network Access

For your deployed Render backend to communicate with MongoDB Atlas, Atlas must allow incoming traffic from Render's dynamic IP addresses.

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation sidebar under **Security**, click **Network Access**.
3. Click the green **+ Add IP Address** button.
4. Click **Allow Access from Anywhere** (this automatically enters `0.0.0.0/0`).
   > *Why?* Render Web Services on the free/starter tier use dynamic outbound IP addresses. Allowing `0.0.0.0/0` enables Render to reach your database securely using your username, password, and SSL/TLS encryption.
5. Click **Confirm**. Wait 1–2 minutes until the status becomes **Active**.
6. Obtain your connection string:
   - Under **Deployment**, click **Database**.
   - Click **Connect** next to your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/portfolio?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials. Save this string for Step 5.

---

## Step 2: Push Backend Code to GitHub

Verify that your local changes are committed and pushed to your GitHub repository:

1. Open PowerShell or Terminal in your project root:
   ```bash
   git status
   ```
2. Stage only source and example configuration files; never stage `.env`:
   ```bash
   git add .gitignore .env.example server/.env.example README.md DEPLOYMENT.md models.js server.js seed.js server/server.js server/seed.js
   git diff --cached --name-only
   git diff --cached --check
   ```
3. Verify that `.env` and `node_modules` are NOT staged, then commit and push:
   ```bash
   git commit -m "Move backend credentials to environment variables"
   git push origin main
   ```

---

## Step 3: Create a Render Account & Connect GitHub

1. Visit [Render](https://render.com/) and click **Sign Up** or **Log In**.
2. Sign in using your **GitHub** account (`mahendrabaghe`).
3. Authorize Render to access your GitHub repositories.

---

## Step 4: Create Render Web Service

1. On the Render Dashboard, click the blue **New +** button in the top right.
2. Select **Web Service**.
3. Choose **Build and deploy from a Git repository** and click **Next**.
4. Select your **`portfolio`** repository (or click *Connect a repository* if it doesn't appear immediately).
5. Configure the service settings exactly as follows:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `portfolio-backend` | Or any unique name you prefer |
| **Region** | Choose the closest region | e.g., *Singapore*, *Oregon*, or *Frankfurt* |
| **Branch** | `main` | Production branch |
| **Root Directory** | `server` | **Crucial:** Render will build & run from the `server/` directory |
| **Runtime** | `Node` | Native Node.js runtime |
| **Build Command** | `npm install` | Installs backend dependencies |
| **Start Command** | `npm start` | Runs `node server.js` |
| **Instance Type** | `Free` | Free tier |

---

## Step 5: Add Environment Variables in Render

Still on the Render service creation page (or under the **Environment** tab of your service):

Add the following environment variables:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/portfolio?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `generate_a_random_64_character_string_here` | Secret key used to sign and verify admin login tokens |
| `ADMIN_EMAIL` | Your admin email | Default admin email (auto-created on first run if DB is empty) |
| `ADMIN_PASSWORD` | A unique, strong password | Default admin password |
| `CLIENT_ORIGIN` | `https://mahendrabaghe.github.io` | Your GitHub Pages URL (without trailing slash or `/portfolio/`) |
| `UPLOAD_DIR` | Absolute path of the mounted persistent disk | Optional; persistent storage for experience certificate PDFs |

> [!NOTE]
> Render automatically sets and injects the `PORT` variable. Do not hardcode a port.
> Never share or commit your actual `MONGODB_URI` or `JWT_SECRET` to GitHub.

Experience certificate PDFs are stored under `UPLOAD_DIR` (by default, `server/uploads`) and served from `/uploads/experience-certificates/`. MongoDB stores that public path in each experience record. To keep uploaded PDFs available after a Render restart or deploy, attach a persistent disk and set `UPLOAD_DIR` to its mount path. Without a persistent disk, uploaded files on Render's default filesystem may be removed when the service restarts or deploys.

Click **Create Web Service** at the bottom of the page.

---

## Step 6: Deploy & Verify Backend Health

1. Render will automatically clone the repository, run `npm install`, and execute `npm start`.
2. Monitor the deployment logs in the Render console. Look for:
   ```text
   Server running on port 10000
   MongoDB Connected to remote cluster
   Admin account confirmed.
   ```
3. Once the deployment says **Live**, copy your Web Service URL from the top of the dashboard.
   It will look like:
   ```text
   https://portfolio-backend-xxxx.onrender.com
   ```
4. Test the health check endpoint in your browser:
   ```text
   https://portfolio-backend-xxxx.onrender.com/api/health
   ```
   You should see:
   ```json
   {
     "success": true,
     "message": "Portfolio API is running"
   }
   ```

---

## Step 7: Update Frontend API URL in `config.js`

Now that your Render backend is live and verified, update the frontend configuration to point to it:

1. Open `config.js` (and `public/config.js`) in your project.
2. Locate the line:
   ```javascript
   const RENDER_API_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com/api";
   ```
3. Replace `https://YOUR-RENDER-SERVICE.onrender.com` with your real Render URL:
   ```javascript
   const RENDER_API_BASE_URL = "https://portfolio-backend-xxxx.onrender.com/api";
   ```
4. Save the file.
   *(Notice that when you test on localhost, `config.js` automatically routes to `http://localhost:5000/api`, and when on GitHub Pages, it routes to Render!)*

---

## Step 8: Push Frontend Changes to GitHub

Commit the updated `config.js` so GitHub Pages can use it:

```bash
git add config.js public/config.js
git commit -m "Connect frontend to live Render API URL"
git push origin main
```

Within 1–2 minutes, GitHub Pages will automatically deploy the updated frontend.

---

## Step 9: Test and Verify Production

### 1. Test Public Portfolio
1. Open your live site: `https://mahendrabaghe.github.io/portfolio/`
2. Open Browser Developer Tools (F12) -> **Console** & **Network** tabs.
3. Verify that requests to `/api/profile`, `/api/experiences`, `/api/projects`, `/api/skills` return HTTP 200 without CORS errors.
4. Verify that all your projects, skills, and experience items render seamlessly.

### 2. Test Admin Login
1. Navigate to: `https://mahendrabaghe.github.io/portfolio/admin/index.html`
2. Enter the admin email and password configured for the backend.
3. Click **Login**. You will be smoothly redirected to `dashboard.html`.

### 3. Test CRUD Operations in Admin Panel
1. **Projects:** Add a new test project. Check that it appears in "Existing Projects".
2. **Edit:** Click "✏️ Edit" on the test project, modify its title, and click "💾 Update Project". Verify it updates.
3. **Delete:** Click "🗑 Delete" on the test project and confirm it is removed.
4. **Experience, Skills, Education, Certifications:** Add or update an item in each section.
5. **Profile / About:** Edit a stat (e.g. Problems Solved) and click "💾 Save Stats".

### 4. Cross-Device Verification
1. Open `https://mahendrabaghe.github.io/portfolio/` on your mobile phone or a different computer.
2. Verify that all updates made in the admin panel appear instantly on the public website.
3. Shut down your local development server completely and reload your phone browser. The portfolio continues running 24/7!

---

## Render Free Tier Note (Spin-down Behavior)

Render's free tier puts web services to sleep after 15 minutes of inactivity:
- When a visitor visits your portfolio after the backend has been sleeping, the first API request triggers a **cold start** which takes approximately 30–50 seconds.
- Your portfolio frontend is built to handle this gracefully: default content is preserved on screen and never crashes with an unhandled exception.
- Subsequent requests while active are instantaneous.
- *Tip:* You can use free uptime monitors like [UptimeRobot](https://uptimerobot.com/) to ping `https://portfolio-backend-xxxx.onrender.com/api/health` every 10 minutes if you want your backend to stay continuously awake.

---

## PRODUCTION CHECKLIST

```text
[x] Backend pushed to GitHub
[x] node_modules excluded
[x] .env excluded
[x] .env.example created
[ ] MongoDB Atlas Network Access configured (0.0.0.0/0 allowed)
[ ] Render Web Service created (Root Directory: server)
[ ] MongoDB URI stored in Render environment variables
[ ] JWT secret stored in Render environment variables
[ ] NODE_ENV=production configured in Render
[x] CORS configured for https://mahendrabaghe.github.io and localhost
[x] Express listens on process.env.PORT and 0.0.0.0
[ ] /api/health tested and works on Render
[ ] Frontend config.js points to your live Render URL
[ ] GitHub Pages loads correctly with no CORS errors
[ ] Admin login works against Render API
[ ] Admin CRUD (Add, Edit, Delete) works and updates MongoDB Atlas
[ ] Public portfolio shows updated data
[ ] Tested and confirmed from another device with local PC turned off
```
