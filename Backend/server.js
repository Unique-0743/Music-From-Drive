import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import { google } from "googleapis";
import { parseBuffer } from "music-metadata";
import { Buffer } from "buffer";

dotenv.config();

const app = express();

// ✅ Manual + middleware CORS
app.use((req, res, next) => {
  const allowedOrigin =
    process.env.FRONTEND_URL ||
    "http://localhost:8081"; // fallback for Expo web

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000",
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

// 🔐 Google OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
if (process.env.REFRESH_TOKEN) {
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
}

// 🔁 Refresh token helper
async function refreshAccessTokenIfNeeded() {
  const tokenRes = await oAuth2Client.getAccessToken();
  const token = tokenRes?.token;
  if (!token) throw new Error("Could not obtain access token");
  return token;
}

// 🎵 Extract thumbnail from file metadata
async function extractThumbnailFromDriveFile(fileId, accessToken) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Range: "bytes=0-200000",
        },
      }
    );

    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const metadata = await parseBuffer(buffer, "audio/mpeg");
    const picture = metadata.common?.picture?.[0];

    if (picture?.data) {
      const base64 = Buffer.from(picture.data).toString("base64");
      const mime = picture.format || "image/jpeg";
      return `data:${mime};base64,${base64}`;
    }
  } catch {
    return null;
  }
  return null;
}

// 📂 GET /api/music
app.get("/api/music", async (req, res) => {
  const folderId = req.query.folderId;
  if (!folderId) return res.status(400).json({ error: "Missing folderId" });

  try {
    const accessToken = await refreshAccessTokenIfNeeded();
    const q = `'${folderId}' in parents and mimeType contains 'audio/'`;
    const fields = "files(id,name,mimeType)";

    const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent(
      fields
    )}&supportsAllDrives=true&includeItemsFromAllDrives=true`;

    const driveRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!driveRes.ok) {
      const text = await driveRes.text();
      return res.status(driveRes.status).send(text);
    }

    const data = await driveRes.json();
    const files = data.files || [];
    const baseUrl =
      process.env.BACKEND_URL || "ADD YOUR PROJECT URL";

    const songs = await Promise.all(
      files.map(async (file) => {
        const thumb = await extractThumbnailFromDriveFile(file.id, accessToken);
        return {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          thumbnail: thumb,
          url: `${baseUrl}/api/proxy?fileId=${file.id}`,
        };
      })
    );

    res.json({ files: songs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs", details: String(err) });
  }
});

// 🎧 GET /api/proxy – stream file
app.get("/api/proxy", async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) return res.status(400).json({ error: "Missing fileId" });

    const accessToken = await refreshAccessTokenIfNeeded();
    const range = req.headers.range;

    const headers = { Authorization: `Bearer ${accessToken}` };
    if (range) headers.Range = range;

    const proxyRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers }
    );

    res.status(proxyRes.status);
    res.setHeader("Accept-Ranges", "bytes");

    const passHeaders = ["content-type", "content-length", "content-range"];
    proxyRes.headers.forEach((value, name) => {
      if (passHeaders.includes(name.toLowerCase())) {
        res.setHeader(name, value);
      }
    });

    if (proxyRes.body && proxyRes.body.pipe) proxyRes.body.pipe(res);
    else res.send(Buffer.from(await proxyRes.arrayBuffer()));
  } catch (err) {
    res.status(500).json({ error: "Proxy failed", details: String(err) });
  }
});

// 🖼️ GET /api/thumbnail/:fileId
app.get("/api/thumbnail/:fileId", async (req, res) => {
  try {
    const accessToken = await refreshAccessTokenIfNeeded();
    const thumb = await extractThumbnailFromDriveFile(req.params.fileId, accessToken);
    if (!thumb) return res.status(404).send("No thumbnail found");

    const base64Data = thumb.split(",")[1];
    const mime = thumb.match(/^data:(.*?);/)[1];
    const imgBuffer = Buffer.from(base64Data, "base64");

    res.set("Content-Type", mime);
    res.set("Cache-Control", "public, max-age=3600");
    res.send(imgBuffer);
  } catch {
    res.status(500).send("Failed to load thumbnail");
  }
});

// ✅ Required for Vercel
export const config = {
  api: { bodyParser: false },
};

export default app;
