// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'

import connectDB from "./db/db.js";

//package json dev mn
dotenv.config({
    path: './env'
})



connectDB()


















/* import express from "express";
const app = express()
//effi se pehle ; lagana achi practice hai what if prev lines doesnt have  ;
( async ()=>{
    try {
         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         app.on('error',(error)=>{console.log("err",error);
         throw error;})

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR:",error);
        throw error;
    }
})() */