#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -p pm2@latest -g

# Install build essentials (needed for some npm packages)
sudo apt-get install -y build-essential

# Create app directory if it doesn't exist
mkdir -p ~/phantomwriter

# Set correct permissions
sudo chown -R ubuntu:ubuntu ~/phantomwriter

# Install nginx
sudo apt-get install -y nginx

# Configure nginx
sudo tee /etc/nginx/sites-available/phantomwriter <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/phantomwriter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Install certbot for SSL
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

echo "EC2 setup completed successfully!"