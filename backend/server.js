import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const app = express();
app.use(express.json());

/**
 * OAuth2 Google
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// usa refresh token automaticamente
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

/**
 * TESTE DE VIDA
 */
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

/**
 * Google Analytics 4
 */
app.get("/metrics/ga4", async (_, res) => {
  try {
    const analytics = google.analyticsdata({
      version: "v1beta",
      auth: oauth2Client,
    });

    const response = await analytics.properties.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "sessions" }],
        dimensions: [{ name: "date" }],
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar GA4" });
  }
});

/**
 * Search Console
 */
app.get("/metrics/search-console", async (_, res) => {
  try {
    const searchconsole = google.searchconsole({
      version: "v1",
      auth: oauth2Client,
    });

    const response = await searchconsole.searchanalytics.query({
      siteUrl: process.env.SC_SITE_URL,
      requestBody: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        dimensions: ["date"],
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar Search Console" });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
// servidor backend (placeholder)
