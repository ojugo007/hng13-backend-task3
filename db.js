const mysql = require("mysql2")
require("dotenv").config()

const pool = mysql.createPool({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PWD,
    database : process.env.MYSQL_DB
}).promise()

const getData = async()=>{
    try{

        const[ rows, fields] = await pool.query("SELECT * FROM author")
        console.log(rows)
        console.log(fields)
    }catch(error){
        console.log(error)
    }finally{
        pool.end()
    }

}


getData()