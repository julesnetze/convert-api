const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');

//Server of your choice
const SERVER = 3000;

const convertRouter = require('./routes/convert');

const app = express();

//To prevent CORS-Errors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    next();
});

app.use('/convert', convertRouter);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message: message});
});

//Retrieve the file when starting the server
const filePath = path.join(__dirname, '.', 'exchange_rates.xml');
https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml', (res) => {
    app.listen(SERVER);
    return res.pipe(fs.createWriteStream(filePath));
});

//Updates the file every minute
const retrieveData = () => {
    https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml', (res) => {
    return res.pipe(fs.createWriteStream(filePath));
})}
setInterval(() => {
    retrieveData();
}, (1000 * 60));