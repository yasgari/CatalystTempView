# Fixed Build & Run Commands for Local Development

## The Issues You're Experiencing:
1. Environment variables not loading (showing "NOT SET")
2. macOS socket binding error (`ENOTSUP` on `0.0.0.0:5000`)

## Fixed Commands:

### Build the Application:
```bash
# Build frontend
npx vite build

# Build backend with proper externals
npx esbuild server/index.ts --platform=node --bundle --format=esm --outfile=dist/index.js --external:express --external:dotenv --external:drizzle-orm --external:@neondatabase/serverless --external:passport --external:connect-pg-simple --external:memorystore --external:express-session --external:puppeteer --external:jspdf --external:jspdf-autotable --external:nanoid --external:zod --external:drizzle-zod
```

### Run the Application:
```bash
# Option 1: Use npm start (should work now)
npm start

# Option 2: Direct node execution
node dist/index.js

# Option 3: With explicit environment
NODE_ENV=production node dist/index.js
```

## Environment File Setup:

Make sure your `.env` file is in the **root directory** (same level as `package.json`):

```env
CATALYST_CENTER_BASE_URL=https://10.83.16.152
CATALYST_CENTER_USERNAME=your-username
CATALYST_CENTER_PASSWORD=your-password
NODE_ENV=production
PORT=5000
```

## Troubleshooting:

### If environment variables still show "NOT SET":
```bash
# Check if .env file exists in root
ls -la .env

# Check file contents (be careful not to expose passwords)
head -n 1 .env
```

### If port 5000 is busy:
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process
kill -9 [PID]

# Or use different port
PORT=3000 node dist/index.js
```

### Alternative port binding:
If you continue having socket issues, the server will now automatically use `localhost` instead of `0.0.0.0` on macOS.

## Expected Output:
When working correctly, you should see:
```
Catalyst Center Configuration: { baseUrl: 'SET', username: 'SET', password: 'SET' }
serving on localhost:5000
```

## For VPN Connection:
Once your environment variables are loaded correctly and the server starts, ensure your VPN is connected to access the Catalyst Center at `10.83.16.152`.