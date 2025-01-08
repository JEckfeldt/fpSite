This site was used to identify fingerprint instability in Browser-Device combinations with no changes to either the device or the browser
Automated scripting tools were used to visit the page, close the browser, and repeat. The website will automatically collect the fingerprint of any visiting device.

To Run:
- Download the "fpSite" folder
- Run "npm install" (nodeJS required) in terminal in the same directory as "app.js"
- Type "npm start" afterwards to run the site, the address will be "localhost:80" by default in browser address bar
- The site will automatically collect the fingerprint of the visiting device and save the results to the /json folder
- Refreshing or revisiting the page will be considered another visit and another fingerprint will be collected

Data Set: [Download dataset.zip](https://tinyurl.com/3xymtenc)

The collected experimental data set is linked above. Keep in mind it is quite large at around 2.7GB after unzipping

The json files are named after the visiting user agent with a timestamp appened in the format "useragent-timestamp.json". 
If a user agent appears for the first time (it is not currently in the directory), it is saved as "useragent_base.json". 
All future visits of that user agent are compared to their respective base file enabling us to determine instability in repeated visits from a device.

The json file is split into 4 sub-categories. The "FingerprintJS" entry is the fingerprint using FingeprintJS and all of its default configurations.
The "complexCanvas", "canvasFonts", and "screen" fields are additional fingerprinting checks added to the site to test for instabilities. 
The six complex canvases are increasing in complexity and are visually seen on the main html page. Their respective toDataURL is hashed and stored as a string. 
The canvasFonts is a binary array of 1 for available and 0 for unavailable. The fonts availability are checked by drawing the font to a canvas and comparing the pixel widths. 
The exhaustive list of canvas fonts used for canvas font fingerprinting is found in the fp.js file in the public/js/fp.js
The canvas fingerprinting code is found in the "collectCanvas()" function in public/js/fp.js as well
