import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Resolve module paths safely for both ESM and CJS bundles
const currentFilePath = typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const currentDirPath = typeof __dirname !== "undefined" ? __dirname : path.dirname(currentFilePath);

// Determine environment reliably
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.npm_lifecycle_event === "start" ||
  currentFilePath.endsWith(".cjs") ||
  currentFilePath.includes("dist") ||
  process.argv[1]?.includes("dist");

if (isProduction) {
  process.env.NODE_ENV = "production";
}

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoints for container and probe health checks
app.get(["/health", "/healthz", "/ping", "/api/health"], (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Dynamic robots.txt
app.get("/robots.txt", (req, res) => {
  const host = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const robots = `User-agent: *
Allow: /
Allow: /profile/
Allow: /explore
Allow: /search
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /admin
Disallow: /admin/*
Disallow: /settings
Disallow: /login
Disallow: /register
Disallow: /api/*

Sitemap: ${host}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.send(robots);
});

// Dynamic sitemap.xml
app.get(["/sitemap.xml", "/api/sitemap.xml"], (req, res) => {
  const host = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const now = new Date().toISOString().split("T")[0];

  const sampleUsernames = ["john-doe", "priya-sharma", "arun-kumar", "elena-rostova", "marcus-vance"];

  const urls = [
    `  <url>\n    <loc>${host}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${host}/explore</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    ...sampleUsernames.map(
      (username) =>
        `  <url>\n    <loc>${host}/profile/${username}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    ),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(sitemapXml);
});

// AI Profile Assistant endpoint
app.post("/api/ai/suggest", async (req, res) => {
  const { type, prompt, existingData } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // High-quality deterministic fallback if no API key is provided
      return res.json({
        success: true,
        source: "smart_template",
        result: generateSmartFallback(type, prompt, existingData),
      });
    }

    let systemInstruction = "You are a professional executive resume writer and career branding expert for ProfileHub. Provide clean, concise, impactful, and truthful profile copy.";
    let userPrompt = "";

    if (type === "headline") {
      userPrompt = `Generate 3 strong, concise professional headlines (max 80 characters each) for someone with this background/interest: "${prompt}". Return valid JSON array of strings: ["Headline 1", "Headline 2", "Headline 3"]. Do not include markdown codeblocks.`;
    } else if (type === "bio") {
      userPrompt = `Write an engaging, first-person professional biography (120-180 words) highlighting skills, background, and vision based on: "${prompt}". Return JSON object: {"bio": "..."}.`;
    } else if (type === "skills") {
      userPrompt = `Suggest 8-12 relevant technical, industry, and soft skills for a professional matching: "${prompt}". Return JSON object: {"skills": ["Skill1", "Skill2", ...]}.`;
    } else if (type === "project") {
      userPrompt = `Write a crisp, high-impact 2-3 sentence project description for a portfolio project based on: "${prompt}". Highlight the problem solved, tech stack, and outcome. Return JSON: {"description": "..."}.`;
    } else if (type === "seo") {
      userPrompt = `Generate an SEO meta description (130-155 characters) for a public profile with name "${existingData?.fullName || "Professional"}" and role "${existingData?.profession || prompt}". Return JSON: {"seoDescription": "..."}.`;
    } else {
      userPrompt = `Help improve this profile content: "${prompt}". Return JSON: {"suggestion": "..."}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim() || "{}";
    let parsed = JSON.parse(responseText);
    return res.json({ success: true, source: "gemini", result: parsed });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error?.message || error);
    // Graceful fallback to smart generated response so UI never breaks
    return res.json({
      success: true,
      source: "smart_template_fallback",
      result: generateSmartFallback(type, prompt, existingData),
    });
  }
});

function generateSmartFallback(type: string, prompt: string, existingData: any) {
  const p = (prompt || "").trim();
  if (type === "headline") {
    return [
      `${p ? p : "Software Engineer"} | Building scalable modern web solutions`,
      `Passionate ${p ? p : "Developer"} & Problem Solver`,
      `Full-Stack Innovator specializing in ${p ? p : "Modern Technologies"}`,
    ];
  }
  if (type === "bio") {
    return {
      bio: `I am an ambitious and driven ${p || "professional"} passionate about leveraging technology to solve meaningful real-world challenges. With a strong foundation in modern software architecture, continuous learning, and collaborative development, I thrive on crafting elegant, performant solutions and delivering measurable impact.`,
    };
  }
  if (type === "skills") {
    const lower = p.toLowerCase();
    const suggestions = ["TypeScript", "React", "Node.js", "Cloud Architecture", "System Design", "Git & CI/CD", "REST APIs", "Problem Solving", "Agile Collaboration"];
    if (lower.includes("java") || lower.includes("mca") || lower.includes("bca")) {
      suggestions.unshift("Java", "Spring Boot", "Database Management", "Object-Oriented Design");
    }
    if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) {
      suggestions.unshift("Figma", "UI/UX Design", "Wireframing", "Design Systems", "User Research");
    }
    return { skills: Array.from(new Set(suggestions)).slice(0, 10) };
  }
  if (type === "project") {
    return {
      description: `Engineered a scalable end-to-end solution focused on ${p || "streamlined workflows and real-time data processing"}. Implemented robust state architecture and responsive UI, delivering high performance and seamless user experience.`,
    };
  }
  if (type === "seo") {
    return {
      seoDescription: `Discover ${existingData?.fullName || "the professional profile"} — ${existingData?.profession || "specialist"} on ProfileHub. View skills, verified experience, and portfolio projects.`,
    };
  }
  return { suggestion: `Tailored recommendation for ${p}` };
}

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(process.cwd(), "dist"))
      ? path.resolve(process.cwd(), "dist")
      : currentDirPath;

    app.use(express.static(distPath));

    // Fallback for API routes before SPA catch-all
    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: "API endpoint not found" });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err && !res.headersSent) {
          res.status(500).send("Error loading application");
        }
      });
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `ProfileHub Server running on http://0.0.0.0:${PORT} [mode: ${isProduction ? "production" : "development"}]`
    );
  });

  const handleShutdown = (signal: string) => {
    console.log(`${signal} received, closing HTTP server`);
    server.close(() => {
      console.log("HTTP server closed cleanly");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer();
