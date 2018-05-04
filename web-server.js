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

//POST method for Image Recognition of REGO to Vicroads
app.post('/upload', multipartMiddleware, function(req, res) {
  cloudinary.v2.uploader.upload(req.files.image.path,
    {
      ocr: "adv_ocr"
      }, function(error, result) {
          if( result.info.ocr.adv_ocr.status === "complete" ) {
       
        // API returns rego in JSON 
          let detectedtext = `${result.info.ocr.adv_ocr.data[0].textAnnotations[0].description}`;
          console.log(detectedtext);
          let nospacerego = detectedtext.replace(/[^a-z0-9]/gi, ''); //remove spaces from string to bypass vicroad validation
          console.log(nospacerego);
          let regoraw = nospacerego.substring(0,6);
          console.log(regoraw);
          let rego = regoraw.replace(/[^a-z0-9]/gi, '');
          console.log(rego);

          // Puppeteer for automation and scrapping of data from Vicroads 
          let scrape = async () => {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
        
            await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego',{waitUntil: 'networkidle2'});
            await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",rego);
            try {
                await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
                await page.waitForNavigation({timeout: 5000,waitUntil: 'networkidle0',});
            }
                catch(error){   
                console.log('timed out');
            }
        
            const result = await page.evaluate(() => {
                let data = []; // Create an empty array that will store our data
                let elements = document.querySelectorAll('.detail-module-content'); 
        
                for (var element of elements){ // Loop through each Vehicle Detail
                  let RegoNo = element.childNodes[1].children[1].innerText; // Select the Regno
                  let Status = element.childNodes[3].children[1].innerText; // Select the Status and Expiry Date
                  let Vehicle = element.childNodes[5].children[1].innerText; // Select the Vehicle
                  let Vin = element.childNodes[7].children[1].innerText; // Select the VIN
      
                  data.push({RegoNo,Status,Vehicle,Vin}); // Push an object with the data onto our array
              }
        
                return data; // Return our data array
            });
        
            browser.close();
            return result; // Return the data
        };
        
        scrape().then((Value) => {
       
          if (Value == '') {
              console.log('Rego does not exist, please try again');
              res.send('Rego does not exist, please try again');
          } else {
              let strValue = JSON.stringify(Value[0]);
              let jsonValue = JSON.parse(strValue);
              
              let strRegoNo = JSON.stringify(jsonValue.RegoNo);
              let strStatus = JSON.stringify(jsonValue.Status);
              let strVehicle = JSON.stringify(jsonValue.Vehicle);
              let strVin = JSON.stringify(jsonValue.Vin);
  
           if (strStatus.includes('Current') == true) { 
      
              console.log('Active');
              res.send('Rego is ACTIVE' + strRegoNo +  + strStatus + strVehicle + strVin);
              
              console.log(strRegoNo);
              console.log(strStatus);
              console.log(strVehicle);
              console.log(strVin);   
  
          } else if (strStatus.includes('Cancelled') == true){
             
              console.log('Cancelled');  
              res.send('Rego is CANCELLED' + strRegoNo +  + strStatus + strVehicle + strVin);
            
              console.log(strRegoNo);
              console.log(strStatus);
              console.log(strVehicle);
              console.log(strVin);   
          } else if (strStatus.includes('Expired') == true){
              
             console.log('Expired');
             res.send('Rego has EXPIRED' + strRegoNo +  + strStatus + strVehicle + strVin);
             
             console.log(strRegoNo);
             console.log(strStatus);
             console.log(strVehicle);
             console.log(strVin);   
          } else if (strStatus.includes('Suspended') == true){
  
              console.log('Suspended');  
              res.send('Rego is SUSPENDED' + strRegoNo +  + strStatus + strVehicle + strVin);
              
              console.log(strRegoNo);
              console.log(strStatus);
              console.log(strVehicle);
              console.log(strVin);  
          }
      }
  });
        }
       
      });
 
  });
  

  //POST method to key in REGO to Vicroads
  app.post("/uploadrego",function(request,response){
  
    const puppeteer = require('puppeteer');

    // Puppeteer for automation and scrapping of data from Vicroads 
    let scrape = async () => {

       const browser = await puppeteer.launch({headless: true});
       const page = await browser.newPage();
   
       await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego',{waitUntil: 'networkidle2'});
       await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",'ABC123');
       try {
        await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
        await page.waitForNavigation({timeout: 5000,waitUntil: 'networkidle0',});
    }
        catch(error){   
        console.log('timed out');
    }

       const result = await page.evaluate(() => {
          
           let data = []; // Create an empty array that will store our data
           let elements = document.querySelectorAll('.detail-module-content'); //Selects all Vehicle Details

   
           for (var element of elements){ // Loop through each Vehicle Detail
               let RegoNo = element.childNodes[1].children[1].innerText; // Select the Regno
               let Status = element.childNodes[3].children[1].innerText; // Select the Status and Expiry Date
               let Vehicle = element.childNodes[5].children[1].innerText; // Select the Vehicle
               let Vin = element.childNodes[7].children[1].innerText; // Select the VIN
   
               data.push({RegoNo,Status,Vehicle,Vin}); // Push an object with the data onto our array
           }
   
           return data; // Return our data arraylet strValue = JSON.stringify(Value[0]);
           let jsonValue = JSON.parse(strValue);
           let strStatus = JSON.stringify(jsonValue.Status);
       });
   
       await browser.close();
       return result; // Return the data
   };

   scrape().then((Value) => {
       
    if (Value == '') {
        console.log('Rego does not exist, please try again');
        res.send('Rego does not exist, please try again');
    } else {
        let strValue = JSON.stringify(Value[0]);
        let jsonValue = JSON.parse(strValue);
        
        let strRegoNo = JSON.stringify(jsonValue.RegoNo);
        let strStatus = JSON.stringify(jsonValue.Status);
        let strVehicle = JSON.stringify(jsonValue.Vehicle);
        let strVin = JSON.stringify(jsonValue.Vin);

     if (strStatus.includes('Current') == true) { 

        console.log('Active');
        res.send('Rego is ACTIVE' + strRegoNo +  + strStatus + strVehicle + strVin);
        
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);   

    } else if (strStatus.includes('Cancelled') == true){
       
        console.log('Cancelled');  
        res.send('Rego is CANCELLED' + strRegoNo +  + strStatus + strVehicle + strVin);
      
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);   
    } else if (strStatus.includes('Expired') == true){
        
       console.log('Expired');
       res.send('Rego has EXPIRED' + strRegoNo +  + strStatus + strVehicle + strVin);
       
       console.log(strRegoNo);
       console.log(strStatus);
       console.log(strVehicle);
       console.log(strVin);   
    } else if (strStatus.includes('Suspended') == true){

        console.log('Suspended');  
        res.send('Rego is SUSPENDED' + strRegoNo +  + strStatus + strVehicle + strVin);
        
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);  
    }
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