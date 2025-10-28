const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

async function generateSummaryImage(totalCountries, topCountries, lastRefreshed) {
  const width = 800;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Country Summary Report", 200, 60);

  // Total countries
  ctx.font = "22px Arial";
  ctx.fillText(`Total Countries: ${totalCountries}`, 50, 120);

  // Top 5 countries by estimated GDP
  ctx.fillText("Top 5 by Estimated GDP:", 50, 170);

  ctx.font = "20px Arial";
  topCountries.forEach((c, i) => {
    const gdp = c.estimated_gdp?.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
    ctx.fillText(`${i + 1}. ${c.name} — GDP: ${gdp}`, 70, 210 + i * 40);
  });

  // Timestamp
  ctx.font = "18px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Last refreshed: ${lastRefreshed}`, 50, height - 40);

  // Save file
  const dir = path.join(__dirname, "../cache");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filePath = path.join(dir, "summary.png");
  const out = fs.createWriteStream(filePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  await new Promise((resolve) => out.on("finish", resolve));

  console.log("Summary image generated:", filePath);
}

module.exports = { generateSummaryImage };
