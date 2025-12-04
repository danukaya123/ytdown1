// pages/api/download.js
import { spawn } from "child_process";
import fs from "fs";
import https from "https";

function downloadWithRedirects(url, outPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, redirectCount) => {
      https.get(currentUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectCount >= maxRedirects) return reject(new Error("Too many redirects"));
          return doRequest(res.headers.location, redirectCount + 1);
        }

        if (res.statusCode !== 200) {
          return reject(new Error("Download failed with status " + res.statusCode));
        }

        const fileStream = fs.createWriteStream(outPath, { mode: 0o755 });
        res.pipe(fileStream);

        let total = 0;
        res.on("data", (chunk) => total += chunk.length);

        fileStream.on("finish", () => {
          fileStream.close(() => {
            if (total < 50000) return reject(new Error("Downloaded yt-dlp is too small"));
            resolve(total);
          });
        });

        fileStream.on("error", reject);
      }).on("error", reject);
    };

    doRequest(url, 0);
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const { url, type } = req.body;
    if (!url || !type) return res.status(400).json({ error: "URL and type required" });

    const tmpFile = type === "mp3" ? "/tmp/audio.mp3" : "/tmp/video_360p.mp4";
    const filename = type === "mp3" ? "audio.mp3" : "video_360p.mp4";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

    const ytDlpPath = "/tmp/yt-dlp";
    const ytDlpURL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

    // Download yt-dlp if missing
    if (!fs.existsSync(ytDlpPath)) {
      console.log("Downloading yt-dlp...");
      await downloadWithRedirects(ytDlpURL, ytDlpPath);
      fs.chmodSync(ytDlpPath, 0o755);
      console.log("yt-dlp downloaded successfully");
    }

    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    const args = type === "mp3"
      ? ["-x", "--audio-format", "mp3", "--audio-quality", "9", "-o", tmpFile, url]
      : ["-f", "18", "-o", tmpFile, url];

    console.log("Running yt-dlp with args:", args.join(" "));

    const proc = spawn(ytDlpPath, args);

    proc.stderr.on("data", (d) => console.error("yt-dlp stderr:", d.toString()));
    proc.stdout.on("data", (d) => console.log("yt-dlp stdout:", d.toString()));

    proc.on("close", (code) => {
      console.log("yt-dlp exited with code:", code);

      if (code !== 0) return res.status(500).json({ error: "yt-dlp failed (check logs)" });
      if (!fs.existsSync(tmpFile)) return res.status(500).json({ error: "File not found" });

      const stream = fs.createReadStream(tmpFile);
      stream.pipe(res);
      stream.on("close", () => {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      });
    });

    proc.on("error", (err) => {
      console.error("yt-dlp spawn error:", err);
      return res.status(500).json({ error: "Spawn failed" });
    });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
}
