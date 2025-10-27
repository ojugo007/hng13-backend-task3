const {initDB} = require("../database/db")


// async function refreshDB ({name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url }){
//   const db = await initDB();
//   const sql = `
//     INSERT INTO country (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;
//   //   const values = [
//   //   name ?? null,
//   //   capital ?? null,
//   //   region ?? null,
//   //   population ?? null,
//   //   currency_code ?? null,
//   //   exchange_rate ?? null,
//   //   estimated_gdp ?? null,
//   //   flag_url ?? null
//   // ];
//   const [result] = await db.execute(sql, [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url ]);
//   return result;
// }




async function refreshDB(countries) {
  const db = await initDB();

  if (!Array.isArray(countries) || countries.length === 0) {
    console.log("⚠️ No country data provided for refresh.");
    return;
  }

  // Define SQL for bulk insert
  const sql = `
    INSERT INTO country 
      (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
    VALUES ?
  `;

  // Convert array of objects → array of arrays (for MySQL bulk insert)
  const values = countries.map(c => [
    c.name ?? null,
    c.capital ?? null,
    c.region ?? null,
    c.population ?? 0,
    c.currency_code ?? null,
    c.exchange_rate ?? null,
    c.estimated_gdp ?? null,
    c.flag_url ?? null
  ]);

  try {
    await db.query(sql, [values]);
    console.log(`Inserted ${values.length} countries successfully.`);
  } catch (error) {
    console.error("Error inserting countries:", error.message);
  }
}

async function getCountries(){
  const db = await initDB()

  const sql = `
    SELECT * FROM country
  `
  try{
    const [result] = await db.query(sql)
    console.log("successfully retrieved countries")
    return result;
  }catch(error){
    console.log( "Error retrieving countries:", error.message)
  }
}



module.exports = {
  refreshDB,
  getCountries
}

