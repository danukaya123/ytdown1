// pages/api/download.js  (Next.js API route example)
import { spawn } from "child_process";
import fs from "fs";
import https from "https";
import { pipeline } from "stream";
import { promisify } from "util";

const pump = promisify(pipeline);

async function downloadWithRedirects(url, outPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const _get = (u, redirectsLeft) => {
      https.get(u, (res) => {
        // follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft === 0) return reject(new Error("Too many redirects"));
          return _get(res.headers.location, redirectsLeft - 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed, status ${res.statusCode}`));
        }
        const fileStream = fs.createWriteStream(outPath, { mode: 0o755 });
        let total = 0;
        res.on('data', (chunk) => total += chunk.length);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => resolve(total));
        });
        fileStream.on('error', (err) => reject(err));
      }).on('error', (err) => reject(err));
    };
    _get(url, maxRedirects);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  const { url, type } = req.body;
  if (!url || !type) return res.status(400).json({ error: "URL and type required" });

  const tmpFile = type === "mp3" ? "/tmp/audio.mp3" : "/tmp/video_360p.mp4";
  const filename = type === "mp3" ? "audio.mp3" : "video_360p.mp4";
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

  // Prefer a stable yt-dlp binary URL that doesn't change name.
  // Recommended: direct asset name 'yt-dlp' (no _linux) — GitHub releases redirects to the correct asset.
  const ytDlpPath = "/tmp/yt-dlp";
  const ytDlpDownloadUrl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

  try {
    // If missing, download the binary (follows redirects and validates)
    if (!fs.existsSync(ytDlpPath)) {
      const size = await downloadWithRedirects(ytDlpDownloadUrl, ytDlpPath);
      if (!size || size < 50_000) { // sanity check: real binary > ~50KB (adjust threshold)
        throw new Error("Downloaded yt-dlp looks too small");
      }
      fs.chmodSync(ytDlpPath, 0o755);
      console.log("yt-dlp downloaded:", ytDlpPath, "size:", size);
    }

    // Remove old tmp output if exists
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    const args = type === "mp3"
      ? ["-x", "--audio-format", "mp3", "--audio-quality", "9", "-o", tmpFile, url]
      : ["-f", "18", "-o", tmpFile, url];

    console.log("Spawning yt-dlp:", ytDlpPath, args.join(" "));
    const ytCommand = spawn(ytDlpPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    ytCommand.stderr.on("data", (data) => {
      // Log stderr to see what's failing (useful in Vercel logs)
      console.error("yt-dlp stderr:", data.toString());
    });
    ytCommand.stdout.on("data", (d) => console.log("yt-dlp stdout:", d.toString()));

    ytCommand.on("close", (code) => {
      console.log("yt-dlp exit code:", code);
      if (code !== 0) {
        return res.status(500).send("Download failed");
      }
      // ensure file exists
      if (!fs.existsSync(tmpFile)) {
        console.error("File not found after yt-dlp finished");
        return res.status(500).send("File not found");
      }
      // stream out and cleanup
      const stream = fs.createReadStream(tmpFile);
      stream.pipe(res);
      stream.on("close", () => {
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch(e){/*ignore*/ }
      });
    });

    ytCommand.on("error", (err) => {
      console.error("yt-dlp spawn error:", err);
      return res.status(500).send("yt-dlp spawn failed");
    });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
