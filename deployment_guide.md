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

## 3. Frontend Deployment (Render.com)
1. In Render, click **New +** > **Static Site**.
2. Connect your GitHub repository.
3. **Settings**:
   - **Name**: `smart-waste-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click **Deploy**.

## 4. Update Mobile App
Once your backend is live (e.g., `https://smart-waste-api-epmw.onrender.com`):
1. I have updated [**`mobile/constants/Config.ts`**](file:///c:/Users/DELL/OneDrive/Desktop/smart-waste-management/mobile/constants/Config.ts) for you. 
2. Just re-load your Expo app!

## 5. Troubleshooting "ECONNREFUSED"
If `node seed_cloud.js` fails with `ECONNREFUSED`, follow these steps:
1. **DNS Issue**: Your internet provider might be blocking Atlas DNS. Try changing your PC DNS to Google (**8.8.8.8**) or Cloudflare (**1.1.1.1**).
2. **Standard String**: In `seed_cloud.js`, try using the "Standard Connection String" (the one for older Drivers) which doesn't use the `srv` prefix:
   - Example: `mongodb://<user>:<pass>@cluster0-shard-00-00.lp0ncvh.mongodb.net:27017,...`
   - You can get this from MongoDB Atlas > Connect > Drivers > Select Node.js version 2.2.12 or similar.
