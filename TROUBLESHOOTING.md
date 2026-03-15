# Troubleshooting: Blank Page Issue

## Quick Checks

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check:
- **Console tab** - Look for JavaScript errors (red text)
- **Network tab** - Check if files are loading (should see .js, .css files)
- **Elements tab** - Verify `<div id="root">` exists and has content

### 2. Verify URLs
- **Frontend:** http://localhost:8080 (or http://localhost:5173 if Vite default)
- **Backend:** http://localhost:3000
- Make sure you're accessing the **frontend** URL, not backend

### 3. Check Both Servers Are Running

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should see: "🚀 Server running on port 3000"
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Should see: "Local: http://localhost:8080" (or 5173)
```

### 4. Check Browser Console Errors

Common errors and fixes:

#### Error: "Cannot connect to backend"
- **Fix:** Make sure backend is running on port 3000
- **Fix:** Check `VITE_API_BASE_URL` in frontend `.env`

#### Error: "Failed to fetch"
- **Fix:** Backend not running
- **Fix:** CORS issue - check backend `.env` has correct `CORS_ORIGIN`

#### Error: "Module not found" or import errors
- **Fix:** Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 5. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 6. Check Environment Variables

**Frontend `.env` (create if missing):**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Backend `.env` (in `backend/` folder):**
```env
MONGODB_URI=mongodb://localhost:27017/netward-ai
CORS_ORIGIN=http://localhost:8080
PORT=3000
```

### 7. Verify Dependencies Installed

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

## Common Issues

### Blank White Screen

**Possible Causes:**
1. JavaScript error preventing React from mounting
2. Missing root element in HTML
3. Build/compile error

**Solution:**
1. Check browser console for errors
2. Check terminal where `npm run dev` is running for build errors
3. The ErrorBoundary component should catch and display errors

### Port Already in Use

**Error:** "Port 3000 is already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9
```

### CORS Errors

**Error:** "CORS policy blocked"

**Solution:**
- Update `CORS_ORIGIN` in `backend/.env` to match your frontend URL
- Make sure it includes protocol: `http://localhost:8080` not `localhost:8080`

### Module Resolution Errors

**Error:** "Cannot find module" or "@/" not resolving

**Solution:**
```bash
# Verify vite.config.ts has path alias configured
# Check tsconfig.json has paths configured
# Restart dev server
```

## Step-by-Step Debugging

1. **Stop both servers** (Ctrl+C)

2. **Clean install:**
   ```bash
   # Frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check files exist:**
   - `src/main.tsx`
   - `src/App.tsx`
   - `index.html` has `<div id="root"></div>`

4. **Start backend first:**
   ```bash
   cd backend
   npm run dev
   # Wait for "Server running on port 3000"
   ```

5. **Start frontend:**
   ```bash
   npm run dev
   # Note the URL it shows (usually 8080 or 5173)
   ```

6. **Open that URL in browser**

7. **Check browser console** (F12 → Console tab)

8. **Check terminal output** for errors

## Still Not Working?

If the page is still blank after these steps:

1. **Check the exact error in browser console** - copy the full error message
2. **Check terminal output** - look for TypeScript/build errors
3. **Try accessing** `http://localhost:3000/health` to verify backend works
4. **Verify MongoDB** is running (if using local MongoDB):
   ```bash
   sudo systemctl status mongodb
   ```

## Quick Test

To verify frontend renders at all, temporarily modify `src/pages/Index.tsx`:

```tsx
const Index = () => {
  return <div>TEST - Page is working!</div>;
};
```

If you see "TEST - Page is working!", then React is mounting but there's an issue with ThreatScanner component.

If you still see blank, then there's a more fundamental issue with React setup.
