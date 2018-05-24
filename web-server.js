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


// we set the port pro-grammatically, in case we need to change it later
var port = 3000;

//this is where we are going to fetch our html from
var root = '/public'

//tell express to use the static middleware,
app.use(express.static(__dirname + root));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

global.sess = '';

const multipartMiddleware = multipart();

//Cloudinary & OCR Add-on powered by Googlevision API (Need to make a new account before submitting this)
cloudinary.config({
   cloud_name: 'deiygzqjf',
    api_key: '925858371311764',
   api_secret: 'IRik_qrHCGXdr8RfxD-N2hS8gtQ'
 });
 
//POST method for Image Recognition of REGO to Vicroads
app.post('/upload', multipartMiddleware, function(request, response) {
  cloudinary.v2.uploader.upload(request.files.image.path,
    {
      ocr: "adv_ocr"
      }, function(error, result) {

        function apistatus(){

            try {
                 let status = result.info.ocr.adv_ocr.status;
                 console.log('API working: ' + status);
                 return status;
             }
             catch(error){  
                 let status = 'incomplete'; 
                 console.log('Out of Cloudinary API image recognition credits, please top up');
                 return status;
             }
            
         }
         
          if( apistatus() === "complete" ) {
       
        // API returns rego in JSON 
        function registration(){

            try {
                 let detectedtext = `${result.info.ocr.adv_ocr.data[0].textAnnotations[0].description}`;
                 console.log(detectedtext);
       
                 let nospacerego = detectedtext.replace(/[^a-z0-9]/gi, ''); //remove spaces from string to bypass vicroad validation
                 console.log(nospacerego);
      
                 let regoraw = nospacerego.substring(0,6);
                 console.log(regoraw);
          
                 let rego = regoraw.replace(/[^a-z0-9]/gi, '');
                 console.log(rego);
                 return rego;
             }
             catch(error){  
                 let rego = ''; 
                 console.log('Cannot remove spaces from text');
                 return rego;
             }
            
         }
          console.log('it worked' + '' + registration())

          // Puppeteer for automation and scrapping of data from Vicroads 
          let scrape = async () => {

   
            const browser = await puppeteer.launch({headless:true});
            const page = await browser.newPage();
     try {
            await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego',{waitUntil: 'networkidle2'});
     }
     catch(error){   
         console.log('could not access Vicroads website, try again later');
     }
     try {
            await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",registration());
     }
     catch(error){   
         console.log('Unexpected when typing rego');
     }
            try {
             await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
             await page.waitForNavigation({timeout: 10000,waitUntil: 'networkidle0',});
             console.log('waiting for vicroads');      
         }   
             catch(error){   
             console.log('timed out, did not retrieve data from vicroads ontime');
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

            let imgInvalidPlate = '<img src=.\\images\\plateNotFound.jpg>'
            let imgValidPlate = '<img src=.\\images\\validPlate.jpg>'
            let imgCancelledPlate = '<img src=.\\images\\Cancelled.jpg>'
       
            if (Value == '') {
               // let imgInvalidPlate = '<img src=.\\images\\plateNotFound.jpg>'
        
                console.log('Rego does not exist, please try again');
                response.send(imgInvalidPlate +'</br>'+ '</br>'+ '<b>' + registration() +' Rego does not exist, please try again</b>'+'</br>');
            } else {
                
                let strValue = JSON.stringify(Value[0]);
                let jsonValue = JSON.parse(strValue);
              //  let imgValidPlate = '<img src=.\\images\\validPlate.jpg>'
        
                let strRegoNo = (jsonValue.RegoNo);
                let strStatus = JSON.stringify(jsonValue.Status);
                let strVehicle =(jsonValue.Vehicle);
                let strVin = (jsonValue.Vin);
                expDate = strStatus.slice(strStatus.lastIndexOf('-') + 2,strStatus.length - 1);
                strExpDate = expDate.replace('///g','.');
               
             if (strStatus.includes('Current') == true) { 
                 
                console.log('Active');
               //let imgValidPlate = '<img src=.\\images\\validPlate.jpg>'
                
                response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is ACTIVE</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
             
                console.log(strRegoNo);
                console.log(strStatus);
                console.log(strVehicle);
                console.log(strVin);   
        
            } else if (strStatus.includes('Cancelled') == true){
               
                console.log('Cancelled');  
                response.send(imgCancelledPlate +'</br>'+ '</br>'+'<b>Rego is CANCELLED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
              
                console.log(strRegoNo);
                console.log(strStatus);
                console.log(strVehicle);
                console.log(strVin);   
            } else if (strStatus.includes('Expired') == true){
                
               console.log('Expired');
               response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is EXPIRED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
               
               console.log(strRegoNo);
               console.log(strStatus);
               console.log(strVehicle);
               console.log(strVin);   
            } else if (strStatus.includes('Suspended') == true){
        
                console.log('Suspended');  
                response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is SUSPENDED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
                
                console.log(strRegoNo);
                console.log(strStatus);
                console.log(strVehicle);
                console.log(strVin);  
            }
        }
        });



        }
        else if ( apistatus() === "incomplete" ){
            
            response.send('Image recognition service is down due to insufficient credits, please contact Ansley & Richard');
        }
       
      });
 
  });
  

  //POST method to key in REGO to Vicroads
  app.get("/uploadrego",function(request,response){
  
    const puppeteer = require('puppeteer');
    let plate1 = String(request.query.plate1);
    console.log(plate1);
   
  
    // Puppeteer for automation and scrapping of data from Vicroads 
    let scrape = async () => {

   
       const browser = await puppeteer.launch({headless:true});
       const page = await browser.newPage();
try {
       await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego',{waitUntil: 'networkidle2'});
}
catch(error){   
    console.log('could not access Vicroads website, try again later');
}
try {
       await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",plate1);
}
catch(error){   
    console.log('Unexpected when typing rego');
}
       try {
        await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
        await page.waitForNavigation({timeout: 10000,waitUntil: 'networkidle0',});
        console.log('waiting for vicroads');      
    }   
        catch(error){   
        console.log('timed out, did not retrieve data from vicroads ontime');
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

    let imgInvalidPlate = '<img src=.\\images\\plateNotFound.jpg>'
    let imgValidPlate = '<img src=.\\images\\validPlate.jpg>'
    let imgCancelledPlate = '<img src=.\\images\\Cancelled.jpg>'

    if (Value == '') {
       // let imgInvalidPlate = '<img src=.\\images\\plateNotFound.jpg>'

        console.log('Rego does not exist, please try again');
        response.send(imgInvalidPlate +'</br>'+ '</br>'+'<b>Rego does not exist, please try again</b>'+'</br>');
    } else {
        let strValue = JSON.stringify(Value[0]);
        let jsonValue = JSON.parse(strValue);
     

        let strRegoNo = (jsonValue.RegoNo);
        let strStatus = JSON.stringify(jsonValue.Status);
        let strVehicle =(jsonValue.Vehicle);
        let strVin = (jsonValue.Vin);
        expDate = strStatus.slice(strStatus.lastIndexOf('-') + 2,strStatus.length - 1);
        strExpDate = expDate.replace('///g','.');
       
     if (strStatus.includes('Current') == true) { 
         
        console.log('Active');
        //let imgValidPlate = '<img src=.\\images\\validPlate.jpg>'
        
        response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is ACTIVE</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
     
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);   

    } else if (strStatus.includes('Cancelled') == true){
       
        console.log('Cancelled');  
        response.send(imgCancelledPlate +'</br>'+ '</br>'+'<b>Rego is CANCELLED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
      
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);   
    } else if (strStatus.includes('Expired') == true){
        
       console.log('Expired');
       response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is EXPIRED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
       
       console.log(strRegoNo);
       console.log(strStatus);
       console.log(strVehicle);
       console.log(strVin);   
    } else if (strStatus.includes('Suspended') == true){

        console.log('Suspended');  
        response.send(imgValidPlate +'</br>'+ '</br>'+'<b>Rego is SUSPENDED</b>'+'</br>' + '</br>' + 'Registration No: ' + strRegoNo + '</br>' + 'Expiry Date: ' + strExpDate  + '</br>' + 'Vehicle: ' + strVehicle  + '</br>' + 'Vin No: ' + strVin);
        
        console.log(strRegoNo);
        console.log(strStatus);
        console.log(strVehicle);
        console.log(strVin);  
    }
}
});





  });


 //routes for login  ------------------------------------
app.post("/OKPlateLogin",function(request,response){
 var result ='';

 var user = request.body.username;
 var password = request.body.password;
 //console.log(user);
 //console.log(password);

 var mysql = require('mysql');

 var db_config = {
    host: 'localhost',
      user: 'root',
      password: 'richard1',
      database: 'users'
  };
  
  var connection;
  var sql = 'select * from users where username = ' + mysql.escape(user) + ' and password = ' + mysql.escape(password);
  
  function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {   // The server is either down
    
      console.log("Connected!");
      
     connection.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
          if (result)
              console.log(result);
              sess = 1;
              response.redirect('/OKPlateLoginDirection.html');
          }
              else
                  {console.log("User: " + user + " not found");
  
        response.redirect('/OKPlateLoginDirectionInvalid.html');
       }
    });
    
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();


});

// This Route is to set the session when a user logs in
//-----------------------------------------------------
app.get("/OKPlateLogin",function(request,response){
    console.log("Direct to Login Session");
	if (sess == 1)
		{response.sendFile(__dirname + '/public/OKPlateUploadValidate.html')} 
	else {
			response.sendFile(__dirname + '/public/OKPlateLogin.html')}; 
})
//-----------------------------------------
app.get("/OKPlateLoginMob",function(request,response){
    console.log("Direct to Login Session");
	if (sess == 1)
		{response.sendFile(__dirname + '/public/OKPlateCaptureValidateMob.html')} 
	else {
			response.sendFile(__dirname + '/public/OKPlateLoginMob.html')}; 
})
// This Route is to unset the session when a user logs out
//--------------------------------------------------------
app.get("/OKPlateLogout",function(request,response){
    console.log("Direct to Logoff Session");
		 sess = '';
		 response.sendFile(__dirname + '/public/OKPlateLogout.html')
})
//-----------------------------------------
app.get("/OKPlateLogoutMob",function(request,response){
    console.log("Direct to Logoff Session");
		 sess = '';
		 response.sendFile(__dirname + '/public/OKPlateLogoutMob.html')
})
//-----------------------------------------
  
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