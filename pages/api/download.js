import { spawn } from "child_process";
import fs from "fs";
import https from "https";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { url, type } = req.body;
  if (!url || !type) return res.status(400).json({ error: "URL and type required" });

  const tmpFile = type === "mp3" ? "/tmp/audio.mp3" : "/tmp/video_360p.mp4";

  // Set headers
  const filename = type === "mp3" ? "audio.mp3" : "video_360p.mp4";
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

  const ytDlpPath = "/tmp/yt-dlp";

  // Download yt-dlp if missing
  if (!fs.existsSync(ytDlpPath)) {
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(ytDlpPath);
      https.get(
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux",
        (response) => {
          response.pipe(file);
          file.on("finish", () => {
            fs.chmodSync(ytDlpPath, 0o755);
            resolve();
          });
        }
      ).on("error", (err) => reject(err));
    });
  }

  // Remove old tmp file if exists
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

  // Build yt-dlp command
  const args =
    type === "mp3"
      ? ["-x", "--audio-format", "mp3", "--audio-quality", "9", "-o", tmpFile, url]
      : ["-f", "18", "-o", tmpFile, url];

  const ytCommand = spawn(ytDlpPath, args);

  ytCommand.stderr.on("data", (data) => console.error(data.toString()));

  ytCommand.on("close", (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
      return res.status(500).send("Download failed");
    }

    // Wait until the file actually exists
    if (!fs.existsSync(tmpFile)) {
      console.error("File not found after yt-dlp finished");
      return res.status(500).send("File not found");
    }

    // Stream the file to browser
    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on("close", () => {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    });
  });
}
