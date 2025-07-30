# Cisco Catalyst Center Temperature Monitoring Dashboard

A comprehensive React-based web application for monitoring and reporting temperature data from Cisco Catalyst Center managed network switches. This application provides real-time temperature visualization, alerting, and PDF report generation capabilities.

![Dashboard Preview](docs/dashboard-preview.png)

## Features

### 🌡️ Real-Time Temperature Monitoring
- Live temperature data from Cisco Catalyst Center via `/dna/intent/api/v1/device-health` API
- Automatic categorization: Normal (20-45°C), Warning (45-60°C), Critical (>60°C)
- Visual temperature cards with status indicators
- Interactive temperature trend charts and distribution graphs

### 📊 Interactive Dashboard
- Responsive design with sidebar filtering by site and switch type
- Switch table with sorting, searching, and pagination
- Connection status indicator showing data source (live vs. mock)
- Manual refresh capability with real-time updates

### 📄 PDF Report Generation
- Professional summary and detailed temperature reports
- Actual temperature data extraction with min/max/average statistics
- Site-based filtering for targeted reporting
- Detailed historical temperature readings
- Automated report generation with timestamps

### 🔧 Network Integration
- Secure authentication with Cisco Catalyst Center
- Automatic fallback to mock data when Catalyst Center unavailable
- Support for self-signed certificates
- Connection status monitoring and error handling

## Prerequisites

- Node.js 18+ and npm
- Access to Cisco Catalyst Center with valid credentials
- Network connectivity to Catalyst Center (VPN if on private network)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yasgari/catalyst-center-temperature-monitor.git
cd catalyst-center-temperature-monitor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Cisco Catalyst Center Configuration
CATALYST_CENTER_BASE_URL=https://your-catalyst-center-ip-or-hostname
CATALYST_CENTER_USERNAME=your-username
CATALYST_CENTER_PASSWORD=your-password

# Optional: Database Configuration (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/temperature_monitoring
```

### 4. Start the Application
```bash
# Development mode with hot reloading
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Deployment Options

### Option 1: Docker Deployment
```bash
# Build Docker image
docker build -t catalyst-temperature-monitor .

# Run container
docker run -p 5000:5000 \
  -e CATALYST_CENTER_BASE_URL=https://your-catalyst-center \
  -e CATALYST_CENTER_USERNAME=your-username \
  -e CATALYST_CENTER_PASSWORD=your-password \
  catalyst-temperature-monitor
```

### Option 2: Traditional Server Deployment
```bash
# On your target server
git clone https://github.com/yasgari/catalyst-center-temperature-monitor.git
cd catalyst-center-temperature-monitor
npm install
npm run build

# Set environment variables
export CATALYST_CENTER_BASE_URL=https://your-catalyst-center
export CATALYST_CENTER_USERNAME=your-username  
export CATALYST_CENTER_PASSWORD=your-password

# Start with process manager
pm2 start dist/index.js --name "catalyst-temp-monitor"
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
heroku create your-app-name
heroku config:set CATALYST_CENTER_BASE_URL=https://your-catalyst-center
heroku config:set CATALYST_CENTER_USERNAME=your-username
heroku config:set CATALYST_CENTER_PASSWORD=your-password
git push heroku main
```

#### Digital Ocean App Platform
```yaml
# .do/app.yaml
name: catalyst-temperature-monitor
services:
- name: web
  source_dir: /
  github:
    repo: your-username/catalyst-center-temperature-monitor
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: CATALYST_CENTER_BASE_URL
    value: https://your-catalyst-center
    type: SECRET
  - key: CATALYST_CENTER_USERNAME  
    value: your-username
    type: SECRET
  - key: CATALYST_CENTER_PASSWORD
    value: your-password
    type: SECRET
```

## Network Configuration

### For Internal/Private Networks
If your Catalyst Center is on a private network, ensure the deployment server can access it:

1. **VPN Connection**: Deploy on a server with VPN access to your network
2. **Firewall Rules**: Configure firewall to allow outbound HTTPS (443) to Catalyst Center
3. **DNS Resolution**: Ensure the deployment server can resolve your Catalyst Center hostname

### Required Network Access
- **Outbound HTTPS (443)** to Catalyst Center IP/hostname
- **Inbound HTTP (5000)** for web interface access

## Configuration

### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `CATALYST_CENTER_BASE_URL` | Full URL to Catalyst Center | Yes | - |
| `CATALYST_CENTER_USERNAME` | API username | Yes | - |
| `CATALYST_CENTER_PASSWORD` | API password | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string | No | In-memory storage |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 5000 |

### Catalyst Center API Requirements
- User account with API access permissions
- Access to `/dna/intent/api/v1/device-health` endpoint
- Network devices must support temperature monitoring

## Troubleshooting

### Connection Issues
**Problem**: "ECONNREFUSED" or connection timeout errors
**Solution**: 
- Verify Catalyst Center URL and network connectivity
- Check firewall rules and VPN connection
- Ensure Catalyst Center is accessible from deployment server

**Problem**: Authentication failures
**Solution**:
- Verify username/password credentials
- Check API permissions in Catalyst Center
- Ensure account is not locked

### No Temperature Data
**Problem**: Switches show but no temperature readings
**Solution**:
- Verify network devices support temperature sensors
- Check device health status in Catalyst Center
- Review API response format for temperature field mapping

### Application Not Loading
**Problem**: White screen or loading errors
**Solution**:
- Check browser console for JavaScript errors
- Verify server is running on correct port (5000)
- Ensure all dependencies are installed

## API Endpoints

### Switch Data
- `GET /api/switches` - Get all switches with current temperatures
- `GET /api/switches/:id` - Get specific switch details
- `PATCH /api/switches/:id/temperature` - Update switch temperature

### Dashboard Data
- `GET /api/dashboard/stats` - Get summary statistics
- `GET /api/dashboard/temperature-distribution` - Temperature distribution data
- `GET /api/dashboard/temperature-trends` - Historical trend data
- `POST /api/dashboard/refresh` - Manually refresh data from Catalyst Center

### System Status
- `GET /api/catalyst-center/status` - Check Catalyst Center connection status

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── catalyst-center-api.ts  # Catalyst Center integration
├── shared/               # Shared TypeScript types
└── docs/                # Documentation assets
```

### Building from Source
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests (if implemented)
npm test
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes with appropriate tests
4. Ensure code follows TypeScript best practices
5. Submit a pull request

## Security Considerations

- Store Catalyst Center credentials securely (environment variables, secrets management)
- Use HTTPS in production deployments
- Implement proper authentication for the web interface if needed
- Regularly update dependencies for security patches
- Consider network segmentation for Catalyst Center access

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check troubleshooting guide above
- Review Cisco Catalyst Center API documentation

---

**Built with**: React, TypeScript, Express.js, Tailwind CSS, jsPDF
**Compatible with**: Cisco Catalyst Center 2.2+
