const puppeteer = require('puppeteer');

     // Puppeteer for automation and scrapping of data from Vicroads 
     let scrape = async () => {

        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
    
        await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego',{waitUntil: 'networkidle2'});
        await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",'ABC123');
        await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
        await page.waitForNavigation({timeout: 0,waitUntil: 'networkidle0',})

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
            console.log('Rego does not exist');
        }
        else{
            let strValue = JSON.stringify(Value[0]);
            let jsonValue = JSON.parse(strValue);
            
            let strRegoNo = JSON.stringify(jsonValue.RegoNo);
            let strStatus = JSON.stringify(jsonValue.Status);
            let strVehicle = JSON.stringify(jsonValue.Vehicle);
            let strVin = JSON.stringify(jsonValue.Vin);

         if (strStatus.includes('Current') == true) { 
    
            console.log('Active');
            
            console.log(strRegoNo);
            console.log(strStatus);
            console.log(strVehicle);
            console.log(strVin);   

        }else if (strStatus.includes('Cancelled') == true){
           
            console.log('Cancelled');  

            console.log(strRegoNo);
            console.log(strStatus);
            console.log(strVehicle);
            console.log(strVin);   
        }
		else if (strStatus.includes('Expired') == true){
            
           console.log('Expired');  
           
           console.log(strRegoNo);
           console.log(strStatus);
           console.log(strVehicle);
           console.log(strVin);   
        }
		else if (strStatus.includes('Suspended') == true){

            console.log('Suspended');  
            
            console.log(strRegoNo);
            console.log(strStatus);
            console.log(strVehicle);
            console.log(strVin);  
        }
    }
});

