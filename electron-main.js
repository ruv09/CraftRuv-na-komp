import { app, BrowserWindow, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'node:child_process';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile(join(__dirname, 'dist/index.html'));
}

let backendProcess = null;

function waitForBackendReady(url, attempts = 40, intervalMs = 250) {
  return new Promise((resolve, reject) => {
    let remaining = attempts;
    const timer = setInterval(() => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          clearInterval(timer);
          res.resume();
          resolve(true);
        } else {
          res.resume();
        }
      });
      req.on('error', () => {
        // ignore until attempts exhausted
      });
      req.end();
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timer);
        reject(new Error('Backend did not become ready in time'));
      }
    }, intervalMs);
  });
}

async function startBackend() {
  const backendEntry = join(__dirname, 'backend', 'src', 'index.js');
  backendProcess = spawn(process.execPath, [backendEntry], {
    cwd: __dirname,
    env: { ...process.env, PORT: process.env.PORT || '5000' },
    stdio: 'inherit',
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] exited with code=${code} signal=${signal}`);
  });

  try {
    await waitForBackendReady('http://localhost:5000/health');
    console.log('[backend] ready on http://localhost:5000');
  } catch (err) {
    console.warn('[backend] readiness check failed:', err.message);
  }
}

let splashWindow = null;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    show: true,
  });
  splashWindow.loadFile(join(__dirname, 'splash.html'));
}

app.whenReady().then(async () => {
  createSplash();
  if (!process.env.OPENAI_API_KEY) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'OpenAI key missing',
      message: 'OPENAI_API_KEY is not set. Some AI features will be disabled.',
    });
  }
  await startBackend();
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    try {
      backendProcess.kill('SIGTERM');
    } catch {}
  }
});