import fs from "node:fs";
import path from "node:path";
import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express) {
  // Use __dirname instead of import.meta.dirname
  const distPath = path.resolve(__dirname, "public"); // dist/public is built by Vite

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static frontend
  app.use(express.static(distPath));

  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

(async () => {
  const app = express();
  await runApp((appInstance: Express) => serveStatic(appInstance));
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
