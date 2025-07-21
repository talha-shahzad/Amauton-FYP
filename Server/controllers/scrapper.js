const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua');
const path = require('path');
const fs = require('fs');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

puppeteer.use(StealthPlugin());
//puppeteer.use(AnonymizeUA());

const EXTENSION_PATH = path.join(__dirname, '../Utils/GRABLEY');
const CHROME_EXECUTABLE_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; 
// Path for storing cookies
const COOKIES_FILE_PATH = path.join(__dirname, 'cookies.json');

const Scrapper = async (title,asin) => {

    console.log(`\n Scraping ASIN: ${asin} with Title: ${title} \n`);
    
    const browser = await puppeteer.launch({
        headless: false, 
        executablePath: CHROME_EXECUTABLE_PATH, 
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
        ],
    });
    
    const page = await browser.newPage();

    // Check if cookies exist
    let cookies = [];
    if (fs.existsSync(COOKIES_FILE_PATH)) {
        cookies = JSON.parse(fs.readFileSync(COOKIES_FILE_PATH));
        await page.setCookie(...cookies);
        console.log('Cookies loaded from file.');
    }

   
    const encoded_title = encodeURIComponent(title);
    
    const URL = `https://www.amazon.com/${encoded_title}/dp/${asin}`

    let BSR = null, ItemSold = null, rating = null, reviews = null, description=null, price=0.0, vendorData = [];
    
    try {
        await page.goto(URL, {timeout: 60000} );
    } catch (error) {
        console.error('Error navigating to URL:', error);
        await browser.close(); // Ensure to close the browser
        return {
            BSR: '-1',
            price: '-1',
            ItemSold: '-1',
            quantity: '-1',
            rating: '-1',
            reviews: '-1',
            description:"",
            vendorData: []
        };
    }

    //await sleep(1000); 

    // Extract session cookies after navigating
    const sessionCookies = await page.cookies();
    fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(sessionCookies));
    console.log('Session cookies saved to file.');


    async function scrapeProductData(page) {
        try {

            // Handle each waitForSelector with a try-catch to avoid throwing an error if a timeout occurs
            try {
                await page.waitForSelector('.pvv-ext-BSR a span b', {timeout: 10000});
                BSR = await page.evaluate(() => {
                    let BSRValue = document.querySelector('.pvv-ext-BSR a span b')?.innerText.trim() || null;
                    return BSRValue ? BSRValue.replace("#", "") : null;
                });
            } catch (error) {
                BSR = '-1';
                console.log('Timeout or missing BSR');
            }


            try {
                await page.waitForSelector('#social-proofing-faceout-title-tk_bought .a-text-bold', {timeout: 10000});
                ItemSold = await page.evaluate(() => {
                    let itemSoldValue = document.querySelector('#social-proofing-faceout-title-tk_bought .a-text-bold')?.innerText.trim() || null;
                    if (itemSoldValue) {
                        itemSoldValue = itemSoldValue.replace("+", "");
                        if (itemSoldValue.includes("K")) {
                            itemSoldValue = itemSoldValue.replace("K", "000");
                        }
                    }
                    return itemSoldValue;
                });
            } catch (error) {
                ItemSold = '-1';
                console.log('Timeout or missing ItemSold');
            }

            // try {
            //     await page.waitForSelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay', { timeout: 10000 });
            //     price = await page.evaluate(() => {
            //         let priceElement = document.querySelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay');
            //         if (priceElement) {
            //             let priceWhole = priceElement.querySelector('.a-price-whole')?.innerText.replace(/\D/g, '') || '';
            //             let priceFraction = priceElement.querySelector('.a-price-fraction')?.innerText.replace(/\D/g, '') || '00';
            //             return priceWhole && priceFraction ? `${priceWhole}.${priceFraction}` : null;
            //         }
            //         return null;
            //     });
            // } catch (error) {
            //     price = '-1';
            //     console.log('Timeout or missing price');
            // }
            

            try {
                await page.waitForSelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay', { timeout: 10000 });
                price = await page.evaluate(() => {
                    let priceElement = document.querySelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay');
                    if (priceElement) {
                        let priceWhole = priceElement.querySelector('.a-price-whole')?.innerText.replace(/\D/g, '') || '';
                        let priceFraction = priceElement.querySelector('.a-price-fraction')?.innerText.replace(/\D/g, '') || '00';
                        let priceString = `${priceWhole}.${priceFraction}`;
                        return parseFloat(priceString);  // Ensure price is a number
                    }
                    return null;
                });
            } catch (error) {
                price = -1;  // Ensure error case returns a number
                console.log('Timeout or missing price');
            }
            
            

            


            try {
                await page.waitForSelector('.a-icon-alt', {timeout: 10000});
                rating = await page.evaluate(() => {
                    let ratingValue = document.querySelector('.a-icon-alt')?.innerText.trim() || null;
                    return ratingValue ? ratingValue.replace(" out of 5 stars", "") : null;
                });
            } catch (error) {
                rating = '-1'
                console.log('Timeout or missing rating');
            }

            try {
                await page.waitForSelector('#acrCustomerReviewText', {timeout: 10000});
                reviews = await page.evaluate(() => {
                    let reviewsValue = document.querySelector('#acrCustomerReviewText')?.innerText.trim() || null;
                    if (reviewsValue) {
                        reviewsValue = reviewsValue.replace(" ratings", "");
                        if (reviewsValue.includes(",")) {
                            reviewsValue = reviewsValue.replace(",", "");
                        }
                    }
                    return reviewsValue;
                });
            } catch (error) {
                reviews = '-1'
                console.log('Timeout or missing reviews');
            }

            try {
                await page.waitForSelector('div.pvv-ext-total-quantity span', { timeout: 10000 }); // Wait for the quantity span to load
                quantity = await page.evaluate(() => {
                    let quantityValue = document.querySelector('div.pvv-ext-total-quantity span')?.innerText.trim() || null;
                    if (quantityValue) {
                        // Remove unwanted parts of the text
                        quantityValue = quantityValue.replace("Qty:", "").replace("(show table)", "").trim();
                    }
                    return quantityValue;
                });
            } catch (error) {
                quantity = '-1';  // Return '-1' if quantity is not found or timeout occurs
                console.log('Timeout or missing quantity');
            }


            try {
                await page.waitForSelector('.pvv-ext-wrap-sellers span b', {timeout: 10000});
                vendorData = await page.evaluate(() => {
                    const vendorElements = document.querySelectorAll('.pvv-ext-wrap-sellers span b');
                    const vendors = [];
                    if (vendorElements.length > 0) {
                        vendorElements.forEach(vendor => {
                            vendors.push(vendor.innerText.trim());
                        });
                    }
                    return vendors;
                });
            } catch (error) {
                vendorData = []
                console.log('Timeout or missing vendor data');
            }


            try {
                await page.waitForSelector('#productDescription', { timeout: 10000 });
                description = await page.evaluate(() => {
                    const descriptionElement = document.querySelector('#productDescription p');
                    return descriptionElement ? descriptionElement.innerText.trim() : null;
                });

                console.log("Description: ",description);
            } catch (error) {
                description = 'Description not found or timeout occurred';
                console.log('Timeout or missing description');
            }

            // Return all scraped data, defaulting to null or empty arrays where applicable
            return { price, BSR, ItemSold, quantity , rating, reviews, description, vendorData };

        } catch (error) {
            console.error('Error in scraping process:', error);
            // Return default values in case of an overall error
            return {
                BSR: '-1',
                ItemSold: '-1',
                price: '-1',
                quantity: '-1',
                rating: '-1',
                reviews: '-1',
                description: "",
                vendorData: []
            };
        }
    }

    const productData = await scrapeProductData(page);

    //console.log(productData);
    await browser.close();
    
    return productData;
};

module.exports = Scrapper;