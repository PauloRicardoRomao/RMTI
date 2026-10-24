import fs from 'fs';
import path from 'path';

export function getStorageFilePath(fileName: string): string {
  const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isServerless) {
    const tmpDir = path.join('/tmp', 'rmti-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    const tmpFile = path.join(tmpDir, fileName);
    if (fs.existsSync(tmpFile)) {
      return tmpFile;
    }
    // If not in /tmp yet, copy from bundled repo data if available
    const cwdFile = path.join(process.cwd(), 'data', fileName);
    if (fs.existsSync(cwdFile)) {
      try {
        const content = fs.readFileSync(cwdFile, 'utf-8');
        fs.writeFileSync(tmpFile, content, 'utf-8');
        return tmpFile;
      } catch {
        return cwdFile;
      }
    }
    return tmpFile;
  }

  // Local development
  const localDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(localDir, fileName);
}

export function readStorageFile(fileName: string): string | null {
  try {
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

    if (isServerless) {
      const tmpFile = path.join('/tmp', 'rmti-data', fileName);
      if (fs.existsSync(tmpFile)) {
        return fs.readFileSync(tmpFile, 'utf-8');
      }
    }

    const cwdFile = path.join(process.cwd(), 'data', fileName);
    if (fs.existsSync(cwdFile)) {
      return fs.readFileSync(cwdFile, 'utf-8');
    }
  } catch (err) {
    console.error(`Error reading ${fileName}:`, err);
  }
  return null;
}

export function writeStorageFile(fileName: string, content: string): boolean {
  try {
    const targetPath = getStorageFilePath(fileName);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, content, 'utf-8');
    return true;
  } catch (err) {
    // Fallback directly to /tmp if write failed (e.g. EROFS on read-only serverless filesystem)
    try {
      const tmpDir = path.join('/tmp', 'rmti-data');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(path.join(tmpDir, fileName), content, 'utf-8');
      return true;
    } catch (fallbackErr) {
      console.error(`Failed to write storage file ${fileName}:`, err, fallbackErr);
      return false;
    }
  }
}

