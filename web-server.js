const express = require('express');
const app = express();
const multipart = require('connect-multiparty');
const cloudinary = require('cloudinary');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

//variables required for cheerio 
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');


// we set the port programmatically, in case we need to change it later
var port = 3000;

//this is where we are going to fetch our html from
var root = '/public'

//tell express to use the static middleware,
app.use(express.static(__dirname + root));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const multipartMiddleware = multipart();

//Cloudinary & OCR Add-on powered by Googlevision API (Need to make a new account before submitting this)
cloudinary.config({
    cloud_name: 'dgque5s6r',
    api_key: '619334687283924',
    api_secret: '6HQ8h1PCHPf6TEyI33dUJ9q-mIw'
});

app.post('/upload', multipartMiddleware, function(req, res) {
  cloudinary.v2.uploader.upload(req.files.image.path,
    {
      ocr: "adv_ocr"
      }, function(error, result) {
          if( result.info.ocr.adv_ocr.status === "complete" ) {
       
        // API returns rego in JSON 
      let regoraw = `${result.info.ocr.adv_ocr.data[0].textAnnotations[0].description}`;
          console.log(regoraw);
          rego = regoraw.replace(/\s/g, ''); //remove spaces from string to bypass vicroad validation
          console.log(rego);
          
          // Puppeteer for automation and scrapping of data from Vicroads 
          let scrape = async () => {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
        
            await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego');
            await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",rego);
           // await page.waitFor(10000);
            await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
            await page.waitFor(1000);
        
            const result = await page.evaluate(() => {
                let data = []; // Create an empty array that will store our data
                let elements = document.querySelectorAll('.detail-module-content'); 
        
                for (var element of elements){ // Loop through each proudct
                    let Status = element.childNodes[3].innerText; // Select the Status and Expiry Date
                    let Vehicle = element.childNodes[5].innerText; // Select the Vehicle
                    let VIN = element.childNodes[7].innerText; // Select the VIN
        
                    data.push({Status,Vehicle,VIN}); // Push an object with the data onto our array
                }
        
                return data; // Return our data array
            });
        
            browser.close();
            return result; // Return the data
        };
        
        scrape().then((value) => {
          let Registration = `${Status.info.ocr.adv_ocr.data[0].textAnnotations[0].description}`;
            console.log(value); // Success!
        });
        }
        
      });
  });
  
  
  
  //start the app and listen to the port

var fs = require('fs')
, Log = require('log')
, log = new Log('info', fs.createWriteStream('success.log'));

var server = app.listen(3000, function (){
  console.log("Calling app.listen().");
var host = server.address().address;
var port = server.address().port;
log.info('Webserver started successfully');
});