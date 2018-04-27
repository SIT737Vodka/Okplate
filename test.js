const puppeteer = require('puppeteer');

     // Puppeteer for automation and scrapping of data from Vicroads 
     let scrape = async () => {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
    
        await page.goto('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry?utm_source=VR-checkrego&utm_medium=button&utm_campaign=VR-checkrego');
        await page.type("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_VehicleSearch_RegistrationNumberCar_RegistrationNumber_CtrlHolderDivShown",'AOI190');
       // await page.waitFor(10000);
        await page.click("input#ph_pagebody_0_phthreecolumnmaincontent_1_panel_btnSearch"); // Click the search button to submit
        await page.waitFor(1000);
    
        const result = await page.evaluate(() => {
            let data = []; // Create an empty array that will store our data
            let elements = document.querySelectorAll('.detail-module-content'); //Selects all Vehicle Details
    
            for (var element of elements){ // Loop through each Vehicle Detail
                let Status = element.childNodes[3].children[1].innerText; // Select the Status and Expiry Date
                let Vehicle = element.childNodes[5].children[1].innerText; // Select the Vehicle
                let VIN = element.childNodes[7].children[1].innerText; // Select the VIN
    
                data.push({Status,Vehicle,VIN}); // Push an object with the data onto our array
            }
    
            return data; // Return our data array
        });
    
        browser.close();
        return result; // Return the data
    };

    scrape().then((Value) => {
        
    //    if (Value == '') {
           // console.log('Does not exist');
      //  } else { 
            console.log(Value[0]); // Success!
       // }
});