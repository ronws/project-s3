# Gemini Flash UI - Frontend Web Interface

A simple web UI for interacting with the Gemini Flash API backend.

## 🚀 Quick Start

### 1. Serve the Frontend

Since this is a static HTML/JS/CSS project, you can serve it with any static file server:

**Option A: Using Python**
```bash
cd gemini-flash-ui
python3 -m http.server 8080
```

**Option B: Using Node.js `serve`**
```bash
npm install -g serve
serve -s . -l 8080
```

**Option C: Using VS Code Live Server**
- Right-click `index.html` → "Open with Live Server"

### 2. Start the Backend

```bash
cd gemini-flash-api
npm run dev
```

### 3. Open the UI

Navigate to: http://localhost:8080

**Important**: Update the "Backend API URL" field in the UI to match your backend:
- Default: `http://localhost:4443`

---

## 📋 Features

### ✅ Implemented
- ✨ **Text Generation** - Send prompts to Gemini
- 💬 **Chat Interface** - Multi-turn conversations with history
- 🖼️ **Image Analysis** - Upload and analyze images
- ⚙️ **Configurable Parameters** - Temperature, max tokens, etc.
- 📊 **Response Display** - JSON-formatted API responses

### 🔧 Backend Configuration

The frontend connects to the backend via CORS. Ensure your backend `.env` has:

```env
# Allow frontend origin (adjust port as needed)
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

Or allow all origins during development:
```env
CORS_ORIGINS=*
```

---

## 📂 File Structure

```
gemini-flash-ui/
├── index.html          # Main UI page
├── style.css           # Styling (gradient theme)
├── app.js              # JavaScript (API calls, UI logic)
├── package.json        # Node project metadata
└── README.md          # This file
```

---

## 🔗 API Endpoints Used

The frontend calls these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check backend status |
| `/gemini/text` | POST | Text generation |
| `/gemini/chat` | POST | Chat conversations |
| `/gemini/image` | POST | Image analysis |

All endpoints accept optional `config` objects for generation parameters.

---

## 🎨 Customization

### Change Backend URL
Edit the "Backend API URL" field in the UI, or modify `app.js`:
```javascript
const API_URL_INPUT = document.getElementById('apiUrl');
// Default value set in index.html
```

### Styling
Edit `style.css` to change colors, layout, etc. The current theme uses:
- Gradient background: `#667eea` to `#764ba2`
- Primary color: `#4285f4` (Google Blue)
- Accent: `#34a853` (Google Green)

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
1. Ensure backend is running: `cd gemini-flash-api && npm run dev`
2. Check backend URL in UI (default: `http://localhost:4443`)
3. Verify CORS settings in backend `.env`

### CORS Errors
Update backend `.env`:
```env
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

Or temporarily allow all:
```env
CORS_ORIGINS=*
```

### Image Upload Not Working
- Ensure image is under 10MB (backend limit)
- Check browser console for errors
- Verify backend has `multer` installed

---

## 🚧 Future Enhancements

- [ ] Add document upload support
- [ ] Add audio processing UI
- [ ] Add responseSchema/JSON mode UI
- [ ] Add token usage display
- [ ] Add conversation export/import
- [ ] Migrate to React/Vue for better state management

---

## 📞 Support

For backend issues, see: `../gemini-flash-api/README.md`

**Version**: 1.0.0  
**Status**: ✅ Basic Implementation Complete  
**Last Updated**: May 8, 2026
