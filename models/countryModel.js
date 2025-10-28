const { initDB } = require("../database/db");

async function refreshDB(countries) {
  const db = await initDB();

  if (!Array.isArray(countries) || countries.length === 0) {
    console.log("⚠️ No country data provided for refresh.");
    return;
  }

  const sql = `
    INSERT INTO country 
      (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
    VALUES ?
  `;

  const values = countries.map((c) => [
    c.name ?? null,
    c.capital ?? null,
    c.region ?? null,
    c.population ?? 0,
    c.currency_code ?? null,
    c.exchange_rate ?? null,
    c.estimated_gdp ?? null,
    c.flag_url ?? null,
  ]);

  try {
    await db.query("TRUNCATE TABLE country");
    await db.query(sql, [values]);
    console.log(`Inserted ${values.length} countries successfully.`);
  } catch (error) {
    console.error("Error inserting countries:", error.message);
  }
}

async function getCountries({ region, currency, sort }) {
  const db = await initDB();

  
  let sql = "SELECT * FROM country";
  const params = [];

  const filters = [];
  if (region) {
    filters.push("LOWER(region) = LOWER(?)");
    params.push(region);
  }
  if (currency) {
    filters.push("LOWER(currency_code) = LOWER(?)");
    params.push(currency);
  }

  if (filters.length > 0) {
    sql += " WHERE " + filters.join(" AND ");
  }

  if (sort) {
    switch (sort.toLowerCase()) {
      case "gdp_desc":
        sql += " ORDER BY estimated_gdp DESC";
        break;
      case "gdp_asc":
        sql += " ORDER BY estimated_gdp ASC";
        break;
      case "name_asc":
        sql += " ORDER BY name ASC";
        break;
      case "name_desc":
        sql += " ORDER BY name DESC";
        break;
      default:
        console.warn(`Ignoring invalid sort option: ${sort}`);
    }
  }

  try {
    const [rows] = await db.query(sql, params);
    console.log(`Retrieved ${rows.length} countries`);
    return rows;
  } catch (error) {
    console.error("Error retrieving countries:", error.message);
    return {error : 'Error retrieving countries'}
  }
}

async function getCountryByName(name) {
  const db = await initDB();
  const sql = `
    SELECT * FROM country
      WHERE name = ?
  `;
  try {
    const [result] = await db.query(sql, [name]);

    if (result.length === 0) {
      return { error: "country not found" };
    }
    return result;
  } catch (error) {
    console.log("Error retrieving country:", error.message);
    console.error("Error retrieving country:", error.message);
    return { error: "database error" };
  }
}

async function DeleteCountry(name) {
  const db = await initDB();
  try {
    const sql = `
      DELETE FROM country
        WHERE name = ?
    `;
    const [result] = await db.query(sql, [name]);

    if (result.affectedRows === 0) {
      return { error: "country not found" };
    }
    return { message: "successfully deleted country" };
  } catch (error) {
    return { error: error.message };
  }
}

async function getStatus() {
  const db = await initDB();
  const sql = `
    SELECT COUNT(*) AS total_countries, MAX(last_refreshed_at) AS last_updated_at FROM country
  `;
  try {
    const [result] = await db.query(sql);
    return result[0];
  } catch (error) {
    return { error: error.message };
  }
}



async function updateCountryByName(country) {
  const db = await initDB();
  console.log("105 MODEL ",country.name)
  const [rows] = await db.execute(
    "SELECT * FROM country WHERE LOWER(name)=LOWER(?)",
    [country.name]
  );

  if (rows.length === 0) {
    // If not found → insert new record
    await db.execute(
      `INSERT INTO country 
       (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        country.name,
        country.capital || null,
        country.region || null,
        country.population || null,
        country.currency_code || null,
        country.exchange_rate || null,
        country.estimated_gdp || null,
        country.flag_url || null,
      ]
    );
    return { message: `Inserted '${country.name}' successfully` };
  }

  const existing = rows[0];

  const merged = {
    capital: country.capital ?? existing.capital,
    region: country.region ?? existing.region,
    population: country.population ?? existing.population,
    currency_code: country.currency_code ?? existing.currency_code,
    exchange_rate: country.exchange_rate ?? existing.exchange_rate,
    estimated_gdp: country.estimated_gdp ?? existing.estimated_gdp,
    flag_url: country.flag_url ?? existing.flag_url,
  };

  //  Update with merged data
  await db.execute(
    `UPDATE country
     SET capital=?, region=?, population=?, currency_code=?, 
         exchange_rate=?, estimated_gdp=?, flag_url=?, 
         last_refreshed_at=CURRENT_TIMESTAMP
     WHERE LOWER(name)=LOWER(?)`,
    [
      merged.capital,
      merged.region,
      merged.population,
      merged.currency_code,
      merged.exchange_rate,
      merged.estimated_gdp,
      merged.flag_url,
      country.name,
    ]
  );

  return {  message: `Updated '${country.name}' successfully` };
}



module.exports = {
  refreshDB,
  getCountries,
  getCountryByName,
  DeleteCountry,
  getStatus,
  updateCountryByName,
};
