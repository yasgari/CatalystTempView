# macOS Setup Guide

## Quick Fix for macOS Issues

### 1. Environment Variables Not Loading

Make sure your `.env` file is in the **root directory** (same level as `package.json`), not inside any subdirectory.

**Correct location:**
```
catalyst-center-temperature-monitor/
├── .env                    ← HERE (root level)
├── package.json
├── README.md
└── ...
```

**Example `.env` file content:**
```env
CATALYST_CENTER_BASE_URL=https://your-catalyst-center-ip
CATALYST_CENTER_USERNAME=your-username
CATALYST_CENTER_PASSWORD=your-password
NODE_ENV=production
PORT=5000
```

### 2. Port Binding Issue (ENOTSUP Error)

The `ENOTSUP: operation not supported on socket 0.0.0.0:5000` error is common on macOS. I've fixed the server code to use `localhost` instead of `0.0.0.0` on macOS.

### 3. Alternative Port (if 5000 is busy)

If port 5000 is already in use:
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process if needed
kill -9 [PID]

# Or use a different port
PORT=3000 npm start
```

## Running the Application

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
# Build first
npm run build

# Then start
npm start
```

### Alternative Startup:
```bash
# If npm start fails, try direct node execution
node dist/index.js
```

## Common macOS Issues

### 1. Permission Errors
```bash
sudo chown -R $(whoami) node_modules/
```

### 2. Node Version
Ensure you're using Node.js 18+:
```bash
node --version
# Should show v18.x.x or higher
```

### 3. Clean Install
If packages are corrupted:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm start
```

## Testing the Application

Once running, test these URLs:
- Main dashboard: `http://localhost:5000`
- API status: `http://localhost:5000/api/catalyst-center/status`
- Switch data: `http://localhost:5000/api/switches`

The application should now work properly on macOS with your Catalyst Center credentials loaded from the `.env` file.