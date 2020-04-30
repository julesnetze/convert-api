const path = require('path');
const fs = require('mz/fs');

const convert = require('xml-js');
const expect = require('chai').expect;
const sinon = require('sinon');

const convertController = require('../controllers/convert');

describe('Testing the Convert functionality', function() {
    let referenceDate;

    before(function(done){
        const filePath = path.join(__dirname, '..', 'exchange_rates.xml');
        fs.readFile(filePath)
            .then(result => {
                const jsData = convert.xml2js(result, {compact: true, spaces: 4});
                return jsData
            })
            .then(jsData => {
                //To find the specific data in the javascript object
                referenceDate = jsData["gesmes:Envelope"]["Cube"]["Cube"][0]._attributes.time;
                return referenceDate
            }).then(() => {
                done();
            })
            .catch(error => {
                console.log(error);
        });     
    })

    const response = {
        amount: null,
        currency: null,
        statusCode: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.amount = data.amount;
            this.currency = data.currency;
        }
    };

    it('Should throw an error with statuscode 500 if no xml data is retrieved', function(done) {
        sinon.stub(fs, 'readFile');
        fs.readFile.resolves(null);

        const request = {
            params: {
                amount: "10",
                srcCurrency: "EUR",
                destCurrency: "USD",
                referenceDate: referenceDate
            }
        }
    
        convertController.convert(request, response, () => {}).then(result => {
            expect(result).to.be.an('error')
            expect(result).to.have.property('statusCode', 500);
            done();
        }).catch(error => console.log(error));
    
        fs.readFile.restore();
    });
    
    it('Should return the same amount when sourceCurrency and destinationCurrency are the same', function(done) {
        const request = {
            params: {
                amount: "10",
                srcCurrency: "EUR",
                destCurrency: "EUR",
                referenceDate: referenceDate
            }
        }

        convertController.convert(request, response, () => {}).then(result => {
            expect(response.amount).to.be.equal(+request.params.amount);
            done();
        }).catch(error => console.log(error));
    })
    
    it('Should return an Error in case of invalid reference date', function(done) {
        const request = {
            params: {
                amount: "10",
                srcCurrency: "USD",
                destCurrency: "EUR",
                referenceDate: "0000-01-01" //Invalid Date
            }
        }
    
        convertController.convert(request, response, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
            expect(result.message).to.be.equal('Reference Date is invalid.');
            done();
        }).catch(error => console.log(error));
    })
    
    it('Should return an Error in case of invalid source currency', function(done) {
    
        const request = {
            params: {
                amount: "10",
                srcCurrency: "USDxyz",
                destCurrency: "EUR",
                referenceDate: referenceDate
            }
        }
    
        convertController.convert(request, response, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
            expect(result.message).to.be.equal('Source Currency is invalid.');
            done();
        }).catch(error => console.log(error));
    })
    
    it('Should return a Number', function(done) { 
        const request = {
            params: {
                amount: "10",
                srcCurrency: "USD",
                destCurrency: "EUR",
                referenceDate: referenceDate
            }
        }      
        convertController.convert(request, response, () => {}).then(result => {
            expect(response.amount).to.be.an('number');
            expect(response).to.have.property('statusCode', 200);
            done();
        }).catch(error => console.log(error));    
    })
});

