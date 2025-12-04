// /api/download.js or pages/api/download.js

import { spawn } from "child_process";
import fs from "fs";
import https from "https";
import path from "path";

// ========== FOLLOW REDIRECTS + DOWNLOAD CLEANLY ==========
function downloadWithRedirects(url, outPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, redirectCount) => {
      https.get(currentUrl, (res) => {
        // If redirect
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectCount >= maxRedirects)
            return reject(new Error("Too many redirects"));

          return doRequest(res.headers.location, redirectCount + 1);
        }

        // Must be OK
        if (res.statusCode !== 200) {
          return reject(
            new Error("Download failed with status " + res.statusCode)
          );
        }

        // Write file
        const fileStream = fs.createWriteStream(outPath, { mode: 0o755 });
        res.pipe(fileStream);

        let total = 0;
        res.on("data", (chunk) => (total += chunk.length));

        fileStream.on("finish", () => {
          fileStream.close(() => {
            // Very important: Check if binary looks valid
            if (total < 100000) {
              // <100KB means it's HTML page, not binary
              return reject(new Error("Downloaded yt-dlp is too small"));
            }
            resolve(total);
          });
        });

        fileStream.on("error", reject);
      }).on("error", reject);
    };

    doRequest(url, 0);
  });
}

// ========== API HANDLER ==========
export default async function handler(req, res) {
  try {
    // Method check
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method Not Allowed" });

    // Validate
    const { url, type } = req.body;
    if (!url || !type)
      return res.status(400).json({ error: "URL and type required" });

    // Temp file output
    const outputPath =
      type === "mp3" ? "/tmp/audio.mp3" : "/tmp/video_360p.mp4";

    const fileName = type === "mp3" ? "audio.mp3" : "video_360p.mp4";

    // Set download headers
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      type === "mp3" ? "audio/mpeg" : "video/mp4"
    );

    // yt-dlp binary location
    const ytDlpPath = "/tmp/yt-dlp";

    // Correct stable binary URL
    const ytDlpURL =
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

    // Download yt-dlp if missing
    if (!fs.existsSync(ytDlpPath)) {
      console.log("Downloading yt-dlp...");

      await downloadWithRedirects(ytDlpURL, ytDlpPath);

      console.log("yt-dlp downloaded OK");
      fs.chmodSync(ytDlpPath, 0o755);
    }

    // Remove old tmp file if exists
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    // yt-dlp args
    const args =
      type === "mp3"
        ? ["-x", "--audio-format", "mp3", "-o", outputPath, url]
        : ["-f", "18", "-o", outputPath, url];

    console.log("Running yt-dlp with args:", args.join(" "));

    const proc = spawn(ytDlpPath, args);

    // Log errors
    proc.stderr.on("data", (d) =>
      console.error("yt-dlp stderr:", d.toString())
    );
    proc.stdout.on("data", (d) =>
      console.log("yt-dlp stdout:", d.toString())
    );

    proc.on("close", (code) => {
      console.log("yt-dlp exited with:", code);

      if (code !== 0) {
        return res.status(500).json({ error: "yt-dlp failed" });
      }

      // Ensure output exists
      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({ error: "Output not found" });
      }

      // Stream to client
      const stream = fs.createReadStream(outputPath);
      stream.pipe(res);

      stream.on("close", () => {
        // Remove temp file
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    });

    proc.on("error", (err) => {
      console.error("Spawn error:", err);
      return res.status(500).json({ error: "Spawn failed" });
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
