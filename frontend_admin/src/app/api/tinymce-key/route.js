import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { NextResponse } from "next/server";

function readFileWithPossibleUtf16(envFilePath) {
  const buf = fs.readFileSync(envFilePath);
  // Detect BOM for UTF-16LE/UTF-16BE
  if (buf.length >= 2) {
    const b0 = buf[0];
    const b1 = buf[1];
    if (b0 === 0xff && b1 === 0xfe) return buf.toString("utf16le"); // UTF-16LE BOM
    if (b0 === 0xfe && b1 === 0xff) {
      // Node doesn't provide utf16be directly; swap bytes and decode as utf16le.
      const swapped = Buffer.from(buf);
      for (let i = 0; i + 1 < swapped.length; i += 2) {
        const tmp = swapped[i];
        swapped[i] = swapped[i + 1];
        swapped[i + 1] = tmp;
      }
      return swapped.toString("utf16le");
    }
  }
  return buf.toString("utf8");
}

function readTinymceKeyFromEnvFile(envFilePath) {
  try {
    if (!fs.existsSync(envFilePath)) return null;
    const content = readFileWithPossibleUtf16(envFilePath);
    // Handle BOM and various whitespace/CRLF by matching anywhere in the line.
    const normalized = content.replace(/^\uFEFF/, "");
    const match = normalized.match(/NEXT_PUBLIC_TINYMCE_API_KEY\s*=\s*([^\r\n]*)/m);
    const raw = match?.[1]?.trim();
    if (!raw) return null;
    // Strip optional surrounding quotes.
    return raw.replace(/^['"]|['"]$/g, "");
  } catch {
    return null;
  }
}

function findEnvLocal(startDir) {
  // Walk up a few levels to locate ".env.local" regardless of Next's cwd.
  const maxDepth = 8;
  let current = startDir;

  for (let i = 0; i <= maxDepth; i++) {
    const candidate = path.resolve(current, ".env.local");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return null;
}

export async function GET() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Try locating ".env.local" from both Next cwd and the route file directory.
  const cwdEnvPath = findEnvLocal(process.cwd());
  const routeEnvPath = findEnvLocal(__dirname);

  const envPaths = [cwdEnvPath, routeEnvPath].filter(Boolean);
  const key = envPaths.map(readTinymceKeyFromEnvFile).find(Boolean) || null;
  return NextResponse.json({ key });
}

