const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser=require('body-parser');
const userRoutes=require('./routes/userRoutes');
const jobRoutes=require('./routes/jobRoutes');
const companyRoutes=require('./routes/companyRoutes');
const applicationRoutes=require('./routes/applicationRoutes');
dotenv.config();  

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(bodyParser.json()); 
app.use('/uploads', express.static('uploads'));
if (!process.env.MONGO_URI) {
    console.log(" MONGO_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Mongo DB connection established');
    })
    .catch((error) => {
        console.log(`Error connecting to MongoDB: ${error}`);
    });
app.use('/user',userRoutes);
app.use('/job',jobRoutes);
app.use('/company',companyRoutes);
app.use('/application',applicationRoutes);
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Server is running successfully ");
});
