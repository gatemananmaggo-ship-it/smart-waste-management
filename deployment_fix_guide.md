# AWS EC2 Nginx Configuration Fix

If you are using Nginx as a reverse proxy on your AWS EC2 instance, you must update your configuration to support WebSockets (Socket.io) and handle CORS preflight requests correctly.

## 1. Locate your Nginx Config
Commonly located at `/etc/nginx/sites-available/default` or similar.

## 2. Updated Configuration Snippet
Replace your `location /` (or the relevant API location) with the following. This ensures that:
- CORS headers are added if missing.
- WebSockets are upgrade correctly.
- Preflight `OPTIONS` requests are handled.

```nginx
server {
    listen 443 ssl;
    server_name 13-232-18-222.sslip.io;

    # ... Your SSL Configuration (Certbot) ...

    location / {
        # Proxy to the Node.js app running on port 5000
        proxy_pass http://localhost:5000;
        
        # Web Socket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Handle CORS Preflight (OPTIONS)
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://smart-waste-web-glpp.onrender.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Explicitly handle Socket.io path if needed
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. Apply Changes
After editing the file, run:
```bash
sudo nginx -t          # Test configuration
sudo systemctl reload nginx   # Apply changes
```

## 4. Restart Backend
Ensure your backend is running with the latest `server.js` changes:
```bash
pm2 restart all
```
