# Deployment Guide: Mobile-Link

Follow these steps to make your backend live so the mobile app can connect from anywhere!

## 1. Cloud Database (MongoDB Atlas)
Your live server cannot reach your computer's local database.
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared Cluster** (Free).
3. **Security**:
   - Go to **Network Access** > **Add IP Address** > **Allow Access from Anywhere** (0.0.0.0/0).
   - Go to **Database Access** > **Add New Database User** (keep the username and password handy).
4. **Connect**:
   - Click **Connect** > **Drivers**.
   - Copy the string: `mongodb+srv://<username>:<password>@cluster0...`

## 2. Live Hosting (Render.com)
1. Sign up at [render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. **Settings**:
   - **Name**: `smart-waste-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `MONGODB_URI`: Paste your connection string (replace `<password>` with your DB user's password).
   - `JWT_SECRET`: Any random string (e.g., `smartwaste_secret_2024`).
6. Click **Deploy**.

## 3. Update Mobile App
Once Render gives you a URL (e.g., `https://smart-waste-api.onrender.com`):
1. Open `mobile/Config.ts` (or your config file).
2. Update the `BASE_URL` to your new Render URL.
3. Re-build the mobile app.

## 4. Hardware Update (ESP32)
1. Update the `serverAddress` in your ESP32 code to the new Render URL.
2. Note: Render uses `HTTPS` (port 443). Ensure your ESP32 code uses `WiFiClientSecure`.
