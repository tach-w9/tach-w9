import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Critical headers for WebContainer (SharedArrayBuffer requirement)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Serve static files from dist directory
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not built. Run "npm run build" first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 TachBuilder Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 URL: http://localhost:${PORT}
🔒 Cross-Origin Isolated: ✓
📦 SharedArrayBuffer: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WebContainer is now ready to boot!
Click "Boot Container" in the terminal panel.

Supported Commands:
• npm install - Install dependencies
• npm run dev - Start dev server
• node <file> - Run Node.js scripts
• ls, cat, pwd, etc.
`);
});
