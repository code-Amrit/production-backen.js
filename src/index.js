// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'

import connectDB from "./db/db.js";
import { app } from './app.js';


//package json dev mn
dotenv.config({
    path: './.env'
})

const Port = process.env.PORT || 8000 ;

connectDB()
.then(()=>{

    app.on("error",(err)=>{
        console.log("ERRRR",err);
        throw err ;
    })

    app.listen(Port,()=>{
        console.log(`Server is running at Port: ${Port}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!!", err);
})


















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