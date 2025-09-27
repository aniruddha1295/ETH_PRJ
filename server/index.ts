import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from 'fs';
import path from 'path';
import flowRoutes from "./routes/flow";

// Load environment variables from .env file
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '' && !line.startsWith('#'))
      .forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    log("Environment variables loaded from .env file");
  } else {
    log(".env file not found — running with system env vars/defaults");
  }
} catch (error) {
  console.error("Error loading .env file:", error);
}

const app = express();
const SessionStore = MemoryStore(session);

app.use("/api", flowRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "portai-session-secret",
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({ checkPeriod: 86400000 }),
  cookie: { secure: false }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});
// Error-handling middleware (for express errors)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// Main async startup
(async () => {
  try {
    await registerRoutes(app);

    if (app.get("env") !== "development") {
      serveStatic(app);
    }

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const HOST = 'localhost';

    const server = app.listen(PORT, HOST, () => {
      log(`Server listening at http://${HOST}:${PORT}`);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    }

    server.on('error', (err: any) => {
      console.error("Server startup error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
