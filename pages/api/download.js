import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import https from "https";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { url, type } = req.body;
  if (!url || !type) return res.status(400).json({ error: "URL and type required" });

  // Set filename for browser download
  const filename = type === "mp3" ? "audio.mp3" : "video_360p.mp4";
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

  // Use Vercel writable temp folder
  const tmpPath = "/tmp/yt-dlp";

  // Download yt-dlp if not exists
  if (!fs.existsSync(tmpPath)) {
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tmpPath);
      https.get(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux",
        (response) => {
          response.pipe(file);
          file.on("finish", () => {
            fs.chmodSync(tmpPath, 0o755); // Make executable
            resolve();
          });
        }
      ).on("error", (err) => reject(err));
    });
  }

  // Spawn yt-dlp from temp folder
  let ytCommand;
  if (type === "mp3") {
    ytCommand = spawn(tmpPath, [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "9",
      "-o",
      "-", // stream to stdout
      url
    ]);
  } else {
    ytCommand = spawn(tmpPath, [
      "-f",
      "18",
      "-o",
      "-", // 360p mp4 stream to stdout
      url
    ]);
  }

  // Pipe stdout to browser
  ytCommand.stdout.pipe(res);
  ytCommand.stderr.on("data", (data) => console.error(data.toString()));

  ytCommand.on("close", (code) => {
    if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
    res.end();
  });
}
