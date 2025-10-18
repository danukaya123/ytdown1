import { spawn } from "child_process";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { url, type } = req.body;

  if (!url || !type) return res.status(400).json({ error: "URL and type required" });

  // Set filename for browser download
  const filename = type === "mp3" ? "audio.mp3" : "video_360p.mp4";

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", type === "mp3" ? "audio/mpeg" : "video/mp4");

  // Spawn yt-dlp to stdout
  let ytCommand;

  if (type === "mp3") {
    // Audio only
    ytCommand = spawn("yt-dlp.exe", [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "9",
      "-o",
      "-",
      url
    ]);
  } else {
    // 360p video
    ytCommand = spawn("yt-dlp.exe", [
      "-f",
      "18",
      "-o",
      "-",
      url
    ]);
  }

  // Pipe yt-dlp stdout directly to browser
  ytCommand.stdout.pipe(res);
  ytCommand.stderr.on("data", (data) => console.error(data.toString()));

  ytCommand.on("close", (code) => {
    if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
    res.end();
  });
}
