import ytdl from "ytdl-core";
import { PassThrough } from "stream";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, type } = req.body;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const info = await ytdl.getInfo(url);

    // Determine format
    let format;
    let filename;

    if (type === "mp3") {
      format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
      filename = `${info.videoDetails.title}.mp3`;
      res.setHeader("Content-Type", "audio/mpeg");
    } else {
      // default mp4
      format = ytdl.chooseFormat(info.formats, { quality: "18" }); // 360p mp4
      filename = `${info.videoDetails.title}.mp4`;
      res.setHeader("Content-Type", "video/mp4");
    }

    // Set download headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/[^a-zA-Z0-9_.-]/g, "_")}"`
    );

    // Stream the video/audio
    const stream = ytdl(url, { format });
    const pass = new PassThrough();
    stream.pipe(pass).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download video/audio" });
  }
}
