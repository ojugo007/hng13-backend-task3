const express = require("express")
const router = express.Router()
const axios = require("axios")

router.get("/refresh", async (req, res) => {
    const countries_uri = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";

    const rate_uri = "https://open.er-api.com/v6/latest/USD";

    try {
        const [countries_response, exchange_response] = await Promise.all([
            axios.get(countries_uri),
            axios.get(rate_uri)
        ])

        if (countries_response.status !== 200 || exchange_response.status !== 200) {
            return res.status(503).json({ error: "External data source unavailable", details: "Could not fetch data from restcountries.com" })
        }
        // my logic goes here
        let countryData = countries_response.data
        let exchangeData = exchange_response.data.rates

        function getGdpEstimate(pop, rate) {
            const min = Math.ceil(1000)
            const max = Math.floor(2000)
            const randomValue = Math.floor(Math.random() * (max - min + 1) + min)
            return (pop * randomValue) / rate
        }

        const countryList = countryData.map((country) => {
            const code = country.currencies?.[0]?.code;
            if (!code) {
                delete country.currencies;
                return {
                    ...country,
                    currency_code: null,
                    exchange_rate: null,
                    estimated_gdp: 0
                }

            }
            const rate = exchangeData[code];
            if (!rate) {
                delete country.currencies;
                return {
                    ...country,
                    currency_code: code,
                    exchange_rate: null,
                    estimated_gdp: null
                }
            }

            
            delete country.currencies;
            return {
                ...country,
                currency_code: code,
                exchange_rate: rate,
                estimated_gdp: getGdpEstimate(country.population, rate)
            }
        })

        return res.status(200).json(countryList)

    } catch (error) {
        console.log(error)
        return res.status(504).json({
            error: "Upstream timeout",
            details: "No response from restcountries.com",
        });
    }
})


router.get("/countries", async (req, res) => {
    console.log("got me")
    res.send("server is running")
    try {

    } catch (error) {

    }
})



module.exports = router 