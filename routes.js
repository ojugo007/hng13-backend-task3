const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path")
const fs = require("fs")
const {
  refreshDB,
  getCountries,
  getCountryByName,
  DeleteCountry,
  getStatus,
  updateCountryByName,
} = require("./models/countryModel");
const { initDB } = require("./database/db");
const validateParamType = require("./middleware/validateParamType");
const { getGdpEstimate } = require("./utils/calculateGdp");
const { generateSummaryImage } = require("./utils/generateSummaryImage");

router.post("/refresh", async (req, res) => {
  const countries_uri =
    "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";

  const rate_uri = "https://open.er-api.com/v6/latest/USD";

  try {
    const [countries_response, exchange_response] = await Promise.all([
      axios.get(countries_uri),
      axios.get(rate_uri),
    ]);

    if (countries_response.status !== 200 || exchange_response.status !== 200) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: "Could not fetch data from restcountries.com",
      });
    }

    let countryData = countries_response.data;
    let exchangeData = exchange_response.data.rates;

    const countryList = countryData.map((country) => {
      const code = country.currencies?.[0]?.code;
      if (!code) {
        delete country.currencies;
        return {
          ...country,
          flag_url: country.flag,
          currency_code: null,
          exchange_rate: null,
          estimated_gdp: 0,
        };
      }
      const rate = exchangeData[code];
      if (!rate) {
        delete country.currencies;
        return {
          ...country,
          flag_url: country.flag,
          currency_code: code,
          exchange_rate: null,
          estimated_gdp: null,
        };
      }

      delete country.currencies;
      return {
        ...country,
        flag_url: country.flag,
        currency_code: code,
        exchange_rate: rate,
        estimated_gdp: getGdpEstimate(country.population, rate),
      };
    });

    await refreshDB(countryList);

    // generate summary data
    const db = await initDB();
    const [rows] = await db.query(
      "SELECT name, estimated_gdp FROM country ORDER BY estimated_gdp DESC LIMIT 5"
    );
    const [last_refreshed] = await db.query(
        "SELECT MAX(last_refreshed_at) AS last_updated_at FROM country"
    );
    const timestamp =  last_refreshed[0].last_updated_at
    
    const totalCountries = countryList.length;
    const top5 = rows;
    const lastRefreshed = timestamp.toLocaleString();

    await generateSummaryImage(totalCountries, top5, lastRefreshed);

    return res.status(200).json({
      message: "Countries refreshed successfully and summary image generated.",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { region, currency, sort } = req.query;

    const result = await getCountries({ region, currency, sort });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No countries found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to retrieve countries" });
  }
});

// summary image route handler
router.get("/image", (req, res) => {
  const imagePath = path.join(__dirname, "./cache/summary.png");

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Summary image not found" });
  }

  res.sendFile(imagePath);
});


// GET COUNTRY BY NAME
router.get("/:name", validateParamType, async (req, res) => {
  const { name } = req.params;

  try {
    const result = await getCountryByName(name);
    
    if(result.error === "country not found"){
        return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(error.message);
  }
});

router.delete("/:name", validateParamType, async (req, res) => {
  const { name } = req.params;
  try {
    const result = await DeleteCountry(name);
    if(result.error === "country not found"){
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(error.message);
  }
});

router.put("/:name", validateParamType, async (req, res) => {
    const { name } = req.params;

    const {
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        flag_url,
    } = req.body;
  try {

    let estimated_gdp;

    const country = await getCountryByName(name);

    if (population || exchange_rate) {
      estimated_gdp = getGdpEstimate(
        population || country[0].population,
        exchange_rate || country[0].exchange_rate
      );
    } else {
      estimated_gdp = getGdpEstimate(
        country[0].population,
        country[0].exchange_rate
      );
    }

    const result = await updateCountryByName({
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});



module.exports = router;
