const express = require("express")
const router = require("./routes")
require("dotenv").config()

const PORT = process.env.PORT
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.use("/countries", router)


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