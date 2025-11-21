import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchVideoRequestSchema } from "@shared/schema";
import { instagramGetUrl } from "instagram-url-direct";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/fetch-video", async (req, res) => {
    try {
      const validatedData = fetchVideoRequestSchema.parse(req.body);
      const url = validatedData.url;

      const result = await instagramGetUrl(url);

      if (!result || !result.url_list || result.url_list.length === 0) {
        return res.status(404).json({
          error: "Video not found or unavailable",
          message: "Unable to fetch video from the provided URL. The video might be private or the URL is invalid.",
        });
      }

      const videoUrl = result.url_list[0];
      
      const downloadToken = randomUUID();
      storage.storeDownloadToken(downloadToken, videoUrl);
      
      const videoMetadata = {
        url: url,
        thumbnail: result.thumbnail || undefined,
        title: result.title || undefined,
        username: extractUsername(url),
        downloadUrl: `/api/download-video?token=${downloadToken}`,
        type: determineVideoType(url),
        duration: result.duration || undefined,
      };

      res.json(videoMetadata);
    } catch (error: any) {
      console.error("Error fetching Instagram video:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Invalid URL",
          message: "Please provide a valid Instagram URL",
        });
      }

      if (error.response?.status === 401 || error.message?.includes('401')) {
        return res.status(503).json({
          error: "Service temporarily unavailable",
          message: "Instagram is currently blocking video downloads. Please try again later or use a different video URL.",
        });
      }

      if (error.response?.status === 404 || error.message?.includes('404') || error.message?.includes('not found')) {
        return res.status(404).json({
          error: "Video not found",
          message: "The video could not be found. It may be private, deleted, or the URL may be incorrect.",
        });
      }

      if (error.response?.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
        return res.status(429).json({
          error: "Too many requests",
          message: "Instagram rate limit reached. Please wait a few minutes and try again.",
        });
      }

      res.status(500).json({
        error: "Failed to fetch video",
        message: "Unable to retrieve video information. The video may be private or Instagram's service is temporarily unavailable. Please try again.",
      });
    }
  });

  app.get("/api/download-video", async (req, res) => {
    try {
      const token = req.query.token as string;

      if (!token) {
        return res.status(400).json({
          error: "Missing token",
          message: "Download token is required",
        });
      }

      const videoUrl = storage.getDownloadUrl(token);

      if (!videoUrl) {
        return res.status(404).json({
          error: "Invalid token",
          message: "Download token is invalid or expired",
        });
      }

      const isValidInstagramUrl = (url: string): boolean => {
        try {
          const urlObj = new URL(url);
          
          if (urlObj.protocol !== 'https:') {
            return false;
          }
          
          const hostname = urlObj.hostname;
          
          const isExactMatch = hostname === 'cdninstagram.com' || hostname === 'scontent.cdninstagram.com';
          const isSubdomain = /^[a-z0-9-]+\.cdninstagram\.com$/.test(hostname);
          const isFbcdn = /^scontent[a-z0-9-]*\.fbcdn\.net$/.test(hostname);
          const isInstagramCdn = /^instagram\.[a-z]{2,}[a-z0-9-]*\.fna\.fbcdn\.net$/.test(hostname);
          
          return isExactMatch || isSubdomain || isFbcdn || isInstagramCdn;
        } catch {
          return false;
        }
      };

      if (!isValidInstagramUrl(videoUrl)) {
        storage.deleteDownloadToken(token);
        return res.status(403).json({
          error: "Invalid source",
          message: "Download URL validation failed",
        });
      }

      const response = await fetch(videoUrl);

      if (!response.ok) {
        return res.status(response.status).json({
          error: "Download failed",
          message: "Unable to download video from the source",
        });
      }

      const contentType = response.headers.get('content-type') || 'video/mp4';
      const contentLength = response.headers.get('content-length');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'attachment; filename="instagram-video.mp4"');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      if (response.body) {
        const reader = response.body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          res.write(value);
        }
        
        res.end();
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (error: any) {
      console.error("Error downloading video:", error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: "Download failed",
          message: error.message || "An error occurred while downloading the video",
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

function extractUsername(url: string): string | undefined {
  try {
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/[^/]+/);
    if (match) {
      return undefined;
    }
    const usernameMatch = url.match(/instagram\.com\/([^/]+)/);
    return usernameMatch ? usernameMatch[1] : undefined;
  } catch {
    return undefined;
  }
}

function determineVideoType(url: string): 'reel' | 'igtv' | 'post' {
  if (url.includes('/reel/')) {
    return 'reel';
  } else if (url.includes('/tv/')) {
    return 'igtv';
  } else {
    return 'post';
  }
}
