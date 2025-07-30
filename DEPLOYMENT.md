# Deployment Guide

This guide covers various deployment scenarios for the Cisco Catalyst Center Temperature Monitoring Dashboard.

## Prerequisites

Before deploying, ensure you have:
- Network access to your Cisco Catalyst Center
- Valid Catalyst Center API credentials
- Node.js 18+ (for non-Docker deployments)

## Deployment Scenarios

### 1. On-Premises Server (Recommended for Internal Networks)

This is the recommended approach when your Catalyst Center is on a private network.

#### Ubuntu/Debian Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup application
git clone https://github.com/[your-username]/catalyst-center-temperature-monitor.git
cd catalyst-center-temperature-monitor
npm install
npm run build

# Create environment file
sudo nano /etc/environment
```

Add these lines to `/etc/environment`:
```
CATALYST_CENTER_BASE_URL=https://your-catalyst-center-ip
CATALYST_CENTER_USERNAME=your-username
CATALYST_CENTER_PASSWORD=your-password
```

```bash
# Start application with PM2
pm2 start dist/index.js --name "catalyst-temp-monitor"
pm2 startup
pm2 save

# Setup nginx reverse proxy (optional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/catalyst-monitor
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-server-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/catalyst-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Docker Deployment

#### Single Container
```bash
# Build and run
docker build -t catalyst-temp-monitor .
docker run -d \
  --name catalyst-monitor \
  --restart unless-stopped \
  -p 5000:5000 \
  -e CATALYST_CENTER_BASE_URL=https://your-catalyst-center \
  -e CATALYST_CENTER_USERNAME=your-username \
  -e CATALYST_CENTER_PASSWORD=your-password \
  catalyst-temp-monitor
```

#### Docker Compose (with PostgreSQL)
```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f catalyst-temp-monitor
```

### 3. Cloud Deployment with VPN

For cloud deployments accessing private Catalyst Centers, you'll need VPN connectivity.

#### AWS EC2 with Site-to-Site VPN
```bash
# Launch EC2 instance in VPC with VPN gateway
# Follow on-premises setup steps above

# Ensure security group allows:
# - Inbound: HTTP (80), HTTPS (443), SSH (22)
# - Outbound: HTTPS (443) to Catalyst Center
```

#### Azure VM with VPN Gateway
```bash
# Create VM in VNet connected to on-premises via VPN
# Install application following Ubuntu steps above

# Configure NSG rules:
# - Allow inbound 80/443 from internet
# - Allow outbound 443 to Catalyst Center subnet
```

### 4. Kubernetes Deployment

#### Basic Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalyst-temp-monitor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: catalyst-temp-monitor
  template:
    metadata:
      labels:
        app: catalyst-temp-monitor
    spec:
      containers:
      - name: catalyst-temp-monitor
        image: your-registry/catalyst-temp-monitor:latest
        ports:
        - containerPort: 5000
        env:
        - name: CATALYST_CENTER_BASE_URL
          valueFrom:
            secretKeyRef:
              name: catalyst-secrets
              key: base-url
        - name: CATALYST_CENTER_USERNAME
          valueFrom:
            secretKeyRef:
              name: catalyst-secrets
              key: username
        - name: CATALYST_CENTER_PASSWORD
          valueFrom:
            secretKeyRef:
              name: catalyst-secrets
              key: password
        livenessProbe:
          httpGet:
            path: /api/dashboard/stats
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/catalyst-center/status
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: catalyst-temp-monitor-service
spec:
  selector:
    app: catalyst-temp-monitor
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
---
apiVersion: v1
kind: Secret
metadata:
  name: catalyst-secrets
type: Opaque
data:
  base-url: # base64 encoded URL
  username: # base64 encoded username
  password: # base64 encoded password
```

Apply deployment:
```bash
# Create secrets
kubectl create secret generic catalyst-secrets \
  --from-literal=base-url=https://your-catalyst-center \
  --from-literal=username=your-username \
  --from-literal=password=your-password

# Deploy application
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

## Network Requirements

### Firewall Rules
Ensure these ports are open:

**Outbound from application server:**
- Port 443 (HTTPS) to Catalyst Center IP/hostname
- Port 53 (DNS) for hostname resolution

**Inbound to application server:**
- Port 5000 (or 80/443 if using reverse proxy)
- Port 22 (SSH) for management

### VPN Configuration
If Catalyst Center is on private network:

1. **Site-to-Site VPN**: Connect cloud VPC to on-premises network
2. **Point-to-Site VPN**: Install VPN client on application server
3. **VPN Gateway**: Use cloud provider's VPN gateway service

### Network Testing
```bash
# Test connectivity to Catalyst Center
curl -k -I https://your-catalyst-center

# Test DNS resolution
nslookup your-catalyst-center

# Test application health
curl http://localhost:5000/api/dashboard/stats
```

## Monitoring and Maintenance

### Application Logs
```bash
# PM2 logs
pm2 logs catalyst-temp-monitor

# Docker logs
docker logs catalyst-monitor

# Kubernetes logs
kubectl logs -f deployment/catalyst-temp-monitor
```

### Health Monitoring
Set up monitoring for:
- Application uptime (`/api/dashboard/stats`)
- Catalyst Center connectivity (`/api/catalyst-center/status`)
- System resources (CPU, memory, disk)

### Backup Strategy
- Database backups (if using PostgreSQL)
- Configuration backups (.env files, secrets)
- Application logs rotation

### Updates
```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install

# Rebuild application
npm run build

# Restart services
pm2 restart catalyst-temp-monitor
# or
docker-compose down && docker-compose up -d
```

## Security Considerations

### Credentials Management
- Use environment variables or secrets management
- Rotate passwords regularly
- Use dedicated service account for API access

### Network Security
- Use HTTPS/TLS for all communications
- Implement firewall rules (whitelist approach)
- Consider VPN for additional security layer

### Application Security
- Keep dependencies updated
- Run security audits (`npm audit`)
- Implement authentication if needed
- Use reverse proxy with rate limiting

## Troubleshooting

### Common Issues

**Connection Refused (ECONNREFUSED)**
- Check network connectivity to Catalyst Center
- Verify firewall rules
- Confirm VPN connection if applicable

**Authentication Failures**
- Verify credentials in environment variables
- Check account permissions in Catalyst Center
- Ensure account is not locked

**Application Won't Start**
- Check Node.js version (requires 18+)
- Verify all dependencies installed (`npm install`)
- Check for port conflicts

**No Temperature Data**
- Verify devices have temperature sensors
- Check API permissions for device health
- Review Catalyst Center device status

### Log Analysis
```bash
# Search for specific errors
pm2 logs | grep "ECONNREFUSED"
docker logs catalyst-monitor 2>&1 | grep "Authentication"

# Monitor real-time logs
tail -f /var/log/nginx/access.log
kubectl logs -f deployment/catalyst-temp-monitor
```

### Performance Tuning
- Monitor memory usage (Node.js heap)
- Adjust polling intervals for better performance
- Consider caching for frequently accessed data
- Scale horizontally if needed (multiple instances)

## Support

For deployment assistance:
1. Check this deployment guide
2. Review main README.md troubleshooting section
3. Open GitHub issue with deployment details
4. Include logs and error messages