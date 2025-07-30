# macOS Local Development Setup

## Complete Setup Instructions for macOS

### Step 1: Clone Repository
```bash
git clone https://github.com/yasgari/catalyst-center-temperature-monitor.git
cd catalyst-center-temperature-monitor
```

### Step 2: Install Dependencies
```bash
# Install all Node.js dependencies
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the root directory:
```bash
# Create .env file
cat > .env << 'EOF'
CATALYST_CENTER_BASE_URL=https://10.83.16.152
CATALYST_CENTER_USERNAME=your-username
CATALYST_CENTER_PASSWORD=your-password
NODE_ENV=production
PORT=5000
EOF
```

### Step 4: Build the Application
```bash
# Option 1: Use the custom build script
node build.js

# Option 2: Manual build commands
npm run build
```

### Step 5: Start the Application
```bash
# Start the production server
npm start
```

## Expected Output:
```
Catalyst Center Configuration: { baseUrl: 'SET', username: 'SET', password: 'SET' }
serving on localhost:5000
```

## macOS-Specific Fixes Included:

✅ **Socket Binding**: Server uses `localhost` instead of `0.0.0.0` to prevent `ENOTSUP` errors  
✅ **Environment Variables**: Proper dotenv loading in both development and production  
✅ **Build Process**: Custom build script handles esbuild configuration issues  

## Troubleshooting:

### If you get "vite: command not found":
```bash
# Make sure dependencies are installed
npm install

# Check if vite is installed
npx vite --version
```

### If environment variables show "NOT SET":
```bash
# Verify .env file exists and has content
cat .env

# Make sure file is in the project root directory
ls -la .env
```

### If you get socket binding errors:
The server automatically detects macOS and uses `localhost`. If you still get errors:
```bash
# Check if port is in use
lsof -i :5000

# Use different port
PORT=3000 npm start
```

### If build fails with chunk warnings:
The warnings are non-critical. The application will still build and run correctly.

## VPN Connection:
When connected to your VPN, the application will automatically connect to Catalyst Center at `10.83.16.152`. Without VPN, it uses mock data for demonstration.

## Directory Structure After Setup:
```
catalyst-center-temperature-monitor/
├── .env                    # Your environment variables
├── build.js               # Custom build script
├── package.json           # Dependencies
├── server/
│   └── index.ts          # Fixed server with macOS compatibility
├── client/               # Frontend React app
└── dist/                # Built application (after build)
```

## Production Deployment:
Once working locally, you can deploy using Docker:
```bash
# Build Docker image
docker build -t catalyst-temp-monitor .

# Run with environment variables
docker run -p 5000:5000 --env-file .env catalyst-temp-monitor
```

The application is now fully compatible with macOS development and ready for customer deployment.