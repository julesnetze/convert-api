# Convert - Online Currency Converter in one Web API Endpoint

How to set up Convert?

1. Download this repository.
2. Install if necessary npm on your machine
3. Hit 'npm install' on the terminal to download all the dependencies 
4. Hit 'npm run start-server' to starting running the node server to receive the HTTP GET requests
One side note: In this project I used as a server http://localhost:3000 but you can of course use any server you like. 

How to send a request to the API Endpoint?

Example: http://localhost/amount/src_currency/dest_currency/reference_date

There are four parameters to set:
  - amount: the amount to convert (e.g. 12.35)
  - src_currency: ISO currency code for the source currency to convert (e.g. EUR, USD, GB)
  - dest_currency: ISO currency code for the destination currency to convert (e.g. EUR, USD, GBP)
  - reference_date: reference date for the exchange rate, in YYYY-MM-DD format
  
  An example: http://localhost:3000/12/USD/GBP/2020-04-28
  
  The request will send back a response with a JSON object like this: 
  
  {
    "amount": 12342342423234,
    "currency": "GBP"
  }
  
 Regarding the Exchange Rates
 
The exchange rates are dynamically retrieved when the Convert API Endpoint is started and it automatically retrieves the new exchange rates every minute.
Keep in mind that it covers the exchange rates of the last 90 days any reference date prior to that will result in an error.
 
  
 How to automatically test Convert?
 
 Just run the npm script "test" and checks whether all the tests have been passed.
