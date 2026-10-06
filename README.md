# AI/ML Portfolio with Admin Panel

This project converts a static HTML portfolio into a dynamic, full-stack application.

## Technologies
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

1. **Install Dependencies**
   Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory using `.env.example` as a template.
   Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to your own values.

3. **Seed Database**
   Run the seed script to create the default admin user and initial data:
   ```bash
   npm run seed
   ```
4. **Run Server**
   Start the backend server:
   ```bash
   npm run dev
   ```

4. **Run Frontend**
   Open `index.html` in your browser (preferably via a Live Server extension).
   For Admin, navigate to `admin/index.html`.

## Deployment
- Backend: Deploy the `server` folder to Render or Railway.
- Frontend: Deploy the root folder (or `/docs`) to GitHub Pages, Netlify, or Vercel. 
- Ensure `script.js` and `admin/dashboard.html` fetch URLs point to your deployed backend.
