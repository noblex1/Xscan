# Backend Setup Guide - NetWard AI

This guide will help you set up the backend API with MongoDB and real threat intelligence APIs.

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/netward-ai

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/netward-ai

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:8080

# Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your_key_here
GOOGLE_SAFEBROWSING_API_KEY=your_key_here
```

### 4. Get API Keys

#### VirusTotal API Key
1. Sign up at [VirusTotal](https://www.virustotal.com/)
2. Go to [API Key Page](https://www.virustotal.com/gui/user/your-username/apikey)
3. Copy your API key
4. Free tier: 4 requests/minute, 500 requests/day

#### Google Safe Browsing API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable [Safe Browsing API](https://console.cloud.google.com/apis/library/safebrowsing.googleapis.com)
4. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
5. Create API Key
6. Copy your API key
7. Free tier: 10,000 requests/day

#### PhishTank
- **Free, no API key required**
- Automatically used by the backend
- Rate limited but sufficient for development

### 5. Start the Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:3000`

### 6. Verify Backend is Running

Visit `http://localhost:3000/health` - you should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Testing the API

### Using cURL

**Analyze a URL:**
```bash
curl -X POST http://localhost:3000/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Get Statistics:**
```bash
curl http://localhost:3000/api/v1/threats/statistics
```

**Get Scan History:**
```bash
curl http://localhost:3000/api/v1/threats/history?limit=10
```

### Using Postman or Thunder Client

1. Import the API collection (optional)
2. Test the endpoints manually
3. Check responses for proper data structure

## Frontend Configuration

Update your frontend `.env` file (or create one):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Restart your frontend dev server after adding the environment variable.

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: Authentication failed"**
- Check MongoDB connection string
- Verify username/password for Atlas
- Check IP whitelist in Atlas

**Error: "Cannot connect to MongoDB"**
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check connection string format
- Verify network/firewall settings

### API Key Issues

**Error: "VirusTotal API key not configured"**
- Verify `.env` file exists in `backend/` directory
- Check `VIRUSTOTAL_API_KEY` is set
- Restart the server after updating `.env`

**Error: "Rate limit exceeded"**
- VirusTotal: Free tier = 4 requests/minute
- Google Safe Browsing: Free tier = 10,000 requests/day
- Wait before retrying or upgrade API plan

### Port Already in Use

**Error: "Port 3000 is already in use"**
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

### CORS Issues

**Error: "CORS policy blocked"**
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:8080`
- For Vite, frontend typically runs on port 5173, adjust accordingly

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://your-domain.com
VIRUSTOTAL_API_KEY=...
GOOGLE_SAFEBROWSING_API_KEY=...
```

### Build for Production

```bash
npm run build
npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name netward-api

# Monitor
pm2 monit

# Logs
pm2 logs netward-api
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |
| POST | `/api/v1/threats/analyze-url` | Analyze URL for threats |
| POST | `/api/v1/threats/analyze-file` | Analyze file for threats |
| GET | `/api/v1/threats/history` | Get scan history |
| GET | `/api/v1/threats/statistics` | Get statistics |

## Database Schema

The `ScanHistory` collection stores all scan results:

- `url` - Scanned URL
- `fileName` - File name (if file scan)
- `threatScore` - Threat score (0-100)
- `riskCategory` - LOW, MEDIUM, HIGH, CRITICAL
- `detectionMethods` - Array of detection results
- `technicalDetails` - Detailed technical info
- `createdAt` - Timestamp
- `ipAddress` - Request IP (optional)

## Next Steps

1. ✅ Backend API running
2. ✅ MongoDB connected
3. ✅ Threat APIs integrated
4. 🔄 Frontend connected to backend
5. 📊 Test with real URLs
6. 📈 Monitor performance

## Support

For issues:
1. Check the backend logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB connection
5. Verify API keys are valid

## License

MIT
