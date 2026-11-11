import express from "express";

// The published showcase has no database, payment, webhook, or order dependency.
// Legacy payment modules are retained on disk but are not mounted or imported.
const app = express();
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok", mode: "showcase" });
});
app.use("/api", (_req, res) => {
  res.status(410).json({
    code: "SHOWCASE_ONLY",
    message: "نسخة عرض فقط؛ لا تتوفر خدمات الدفع أو تسجيل الطلبات.",
  });
});
export default app;
