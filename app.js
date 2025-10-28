const express = require("express")
const router = require("./routes")
require("dotenv").config()
const {getStatus} = require("./models/countryModel")

const PORT = process.env.PORT
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use("/countries", router)

app.get("/status", async (req, res) => {
  try {
    const result = await getStatus();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((error, req, res, next)=>{
    console.log("path: ", req.path)
    console.log(error)
   
    const StatusCode = error.status || 500
    const message = error.message || "Internal server error"

    return res.status(StatusCode).json({
        error : message,
    })
    // next()
})

app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})