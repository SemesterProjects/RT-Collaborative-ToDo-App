# Deploying CollabBoard to Render Cloud (PaaS)

This guide takes you through the step-by-step process of deploying your Real-Time Collaborative TODO Board onto Render as a PaaS (Platform as a Service) Web Service. 

> **Important Setup Step First:** This project is already configured so Render will understand exactly what to do. Since `server.js` listens on `process.env.PORT` and `package.json` contains a `start` script, it works out of the box!

---

### Prerequisites
1. A **GitHub** account.
2. A **Render** account (Sign up at [render.com](https://render.com) using your GitHub).
3. Push this repository to a new repository on your GitHub account.

---

## The Easiest Deployment (Native Node.js Web Service)

Since your project uses Node.js standard structure, Render can deploy it automatically directly from the source code without you needing to do any Docker configurations at all.

### Step-by-Step Instructions

1. **Log in to Render Dashboard:**
   - Go to [dashboard.render.com](https://dashboard.render.com/).
2. **Create a New Web Service:**
   - Click the big **"New +"** button in the top right corner.
   - Select **"Web Service"** from the dropdown menu.
3. **Connect Your GitHub Repository:**
   - On the next screen, click the **"Build and deploy from a Git repository"** option.
   - Click **"Next"**.
   - If this is your first time, you may need to click "Connect GitHub" on the right side.
   - Scroll down to the list of your repositories and **search for your repository name** (e.g., `RT-Collaborative-ToDo-App`).
   - Click the **"Connect"** button next to your repository.
4. **Configure the Web Service Settings:**
   You will now be on a settings page. Fill it out as follows:
   - **Name:** Any name you like (e.g., `collab-board-visha`).
   - **Region:** Choose the region closest to you (e.g., Frankfurt, Ohio, Oregon, etc.).
   - **Branch:** `main` (or whatever your default GitHub branch is).
   - **Root Directory:** *(Leave completely blank!)*
   - **Environment:** Select `Node` from the dropdown list.
   - **Build Command:** Type `npm install` 
   - **Start Command:** Type `npm start`
5. **Select Pricing Plan:**
   - Scroll down to the instance types and select the **"Free"** tier ($0/month). 
6. **Deploy!**
   - Scroll to the very bottom and click **"Create Web Service"**.
   
### What Happens Next?
Render will display a terminal logging screen. It will clone your code, run `npm install` to get Express and Socket.IO, and then run `npm start` to run your `server.js`.
Within 2-3 minutes, you will see a green **Live** badge at the top left. Click on the URL right below the name (e.g., `https://collab-board-xyz.onrender.com`) to view your live cloud-deployed site!

---

## Alternative: Deploying using Docker Container (Optional)

You mentioned you have Docker. Render provides a **Native Node PaaS**, which is strictly easier and doesn't require Docker. However, if you *prefer* Docker, I have included a `Dockerfile` and `.dockerignore` in this folder for you.

To use Docker on Render instead:
1. Follow Steps 1, 2, and 3 from above. 
2. At Step 4, under **Environment**, select `Docker` instead of `Node`.
3. Render will magically build the Docker image using the `Dockerfile` inside this folder and run it automatically. No extra commands needed!

> Note: If you deploy on the Free Tier, Render pauses your server after 15 minutes of inactivity. The next time someone opens it, it will take about 50 seconds to "wake up" the server. This is normal for Free Tiers!
