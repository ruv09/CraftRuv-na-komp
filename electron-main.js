import { app, BrowserWindow } from 'electron';
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

app.whenReady().then(async () => {
  await startBackend();
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