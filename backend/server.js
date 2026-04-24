import express from "express"
import 'dotenv/config'
import connectDB from "./config/db.js"
import userRoute from "./routes/userRoute.js"
import authRoute from "./routes/authRoute.js"
import cors from 'cors'
import connectCloud from './config/cloud.js';

const app = express()

await connectCloud();  
const PORT = process.env.PORT || 8000

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true
}))

app.use('/auth', authRoute)
app.use('/user', userRoute)


app.listen(PORT,()=>{
    connectDB()
    console.log(`Server is listening at port ${PORT}`);  
})