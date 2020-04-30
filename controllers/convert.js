const fs = require('mz/fs');
const path = require('path');
const convert = require('xml-js');

exports.convert = (req, res, next) => {
    //Obtain Parameters from Route
    const amount = req.params.amount;
    const sourceCurrency = req.params.srcCurrency.toUpperCase();
    const destinationCurrency = req.params.destCurrency.toUpperCase();
    const referenceDate = req.params.referenceDate;

    //To convert the xml data to a javascript object
    const filePath = path.join(__dirname, '..', 'exchange_rates.xml');   
    return fs.readFile(filePath)
    .then(result => {
        if (!result) {
            const error = new Error('Failed to retrieve data.');
            throw error;
        }
        const jsData = convert.xml2js(result, {compact: true, spaces: 4});
        return jsData
    })
    .then(jsData => {

        //To find the specific data in the javascript object
        const dateCube = jsData["gesmes:Envelope"]["Cube"]["Cube"].find(day => day._attributes.time === referenceDate);
        if (!dateCube) {
            const error = new Error('Reference Date is invalid.');
            error.statusCode = 422;
            throw error;
        }
        let sourceCurrencyRate;
        if (sourceCurrency === 'EUR') {
            sourceCurrencyRate = 1;
        } else {
            const sourceCurrencyCube = dateCube["Cube"].find(element => element._attributes.currency === sourceCurrency);
            if (!sourceCurrencyCube) {
                const error = new Error('Source Currency is invalid.');
                error.statusCode = 422;
                throw error;
            }
            sourceCurrencyRate = +sourceCurrencyCube._attributes.rate;
        }
        let destinationCurrencyRate
        if (destinationCurrency === 'EUR') {
            destinationCurrencyRate = 1;
        } else {
            const destinationCurrencyCube = dateCube["Cube"].find(element => element._attributes.currency === destinationCurrency);
            if (!destinationCurrencyCube) {
                const error = new Error('Destination Currency is invalid.');
                error.statusCode = 422;
                throw error;
            }
            destinationCurrencyRate = +destinationCurrencyCube._attributes.rate;
        }
    
        //Convert Currency
        const convertCurrency = (amount, sourceCurrencyRate, destinationCurrencyRate) => {
            const convertedAmount = +amount / sourceCurrencyRate * destinationCurrencyRate;
            return (Math.round(convertedAmount * 100) / 100);
        };
        const convertedAmount = convertCurrency(amount, sourceCurrencyRate, destinationCurrencyRate);
        return convertedAmount;

    }).then(convertedAmount => {
        //Send Response
        return res.status(200).json({amount: convertedAmount, currency: destinationCurrency});
    }).catch(error => {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
        return(error);
    })
}

