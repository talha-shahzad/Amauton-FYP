const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteerExtra.use(StealthPlugin());

const dynamicData = async (query) => {
    console.log("Query received : ---------------- : ", query);
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const edgeExecutablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

    const browser = await puppeteerExtra.launch({
        headless: false,
        executablePath: edgeExecutablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
    const COOKIES_FILE_PATH = path.join(__dirname, 'cookiesGoogle.json');
    const resultsFilePath = path.join(__dirname, 'GoogleShoppingData.json');
    await page.setUserAgent(randomUserAgent);


    // try {
    //     await page.goto(searchUrl, { waitUntil: 'networkidle0' , timeout: 100000 });
    //     await page.waitForSelector('div[jsname="eWsdId"] > ul > div > li', { timeout: 60000 });

    //     const products = await page.$$('div[jsname="ZvZkAe"]'); // Select all product elements
    //     console.log(`Found ${products.length} products.`);
    //     const allProductsData = [];

    //     for (let i = 0; i < 5; i++) {
    //         console.log(`Processing Result ${i + 1}...`);
        
    //         try {
    //             await products[i].hover();
        
    //             // Click the product to open the sidebar
    //             await products[i].click();
    //             console.log(`Clicked on product ${i + 1}`);
        
    //             // Wait for the sidebar to load
    //             try {
    //                 await page.waitForSelector('div.PshwNb', { visible: true, timeout: 5000 });
    //                 console.log(`Sidebar loaded for product ${i + 1}`);
    //             } catch (e) {
    //                 console.log(`Error loading sidebar for product ${i + 1}:`, e.message);
    //                 continue;
    //             }
        
    //             // Extract store data
    //             const storeData = await page.evaluate(() => {
    //                 const stores = [];
    //                 const storeElements = document.querySelectorAll('div.PshwNb');
    //                 const productImage = document.querySelector('div[jsname="figiqf"] div.DqsAAd img')?.src || '';
    //                 console.log(`---- Product image link: ${productImage}`);
    //                 storeElements.forEach(store => {
    //                     const storeName = store.querySelector('.hP4iBf')?.textContent?.trim() || '';
    //                     const productTitle = document.querySelector('div.Rp8BL.CpcIhb.y1FcZd.rYkzq')?.textContent?.trim() || '';
    //                     const price = store.querySelector('div.GBgquf.JIep9e > span > span[aria-hidden="true"]')?.textContent?.trim() || '';
    //                     const oldPrice = store.querySelector('.AoPnCe span')?.textContent?.trim() || '';
    //                     const deliveryPrice = document.querySelectorAll('div.gASiG')[1]?.textContent?.trim() || '';
    //                     const link = store.querySelector('a')?.href || '';
    //                     const image_similarity = 0;
    //                     const images_similar = true;
    //                     const overall_match = true;
    //                     const titles_consistent = true;
        
    //                     stores.push({
    //                         storeName,
    //                         productTitle,
    //                         price,
    //                         oldPrice,
    //                         deliveryPrice,
    //                         link,
    //                         productImage,
    //                         image_similarity,
    //                         images_similar,
    //                         overall_match,
    //                         titles_consistent
    //                     });
    //                 });
    //                 return stores;
    //             });
        
    //             console.log(`Stores for product ${i + 1}:`, storeData);
        
    //             // Limit the number of stores stored to 5
    //             for (let store of storeData) {
    //                 if (allProductsData.length < 20) {
    //                     allProductsData.push(store);
    //                 } else {
    //                     break;
    //                 }
    //             }
        
    //             // Close the sidebar
    //             const closePanelSelector = '.FAtbld'; // Replace with actual selector
    //             if (await page.$(closePanelSelector)) {
    //                 await page.click(closePanelSelector);
    //                 await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to let the sidebar close
    //             } else {
    //                 console.log('Close button not found.');
    //             }
    //         } catch (error) {
    //             console.log(`Error processing product ${i + 1}:`, error.message);
    //         }
        
    //         // Stop processing if we've already collected 5 stores
    //         if (allProductsData.length >= 15) {
    //             break;
    //         }
    //     }
        
    //     console.log(` ------- Length of returned product: ${allProductsData.length}`);
    //     return allProductsData;
        
    //     // Save the extracted data to a JSON file
    //     // fs.writeFileSync(resultsFilePath, JSON.stringify(allProductsData, null, 2));
    //     // console.log(`Data saved to ${resultsFilePath}`);
        
    // } catch (error) {
    //     console.error('Error:', error.message);
    // } finally {
    //     await browser.close();
    // }
    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 100000 });
        await page.waitForSelector('div[jsname="eWsdId"] > ul > div > li', { timeout: 600000 });
        let products = await page.$$('div[jsname="ZvZkAe"]'); // Select all product elements
        console.log(`Found ${products.length} products.`);
        console.log("----------------------------------------");
    
        const allProductsData = [];
        const uniqueProducts = new Set();
        let previousProductTitle = "";
        let processedProducts = 0;

    
        for (const [index, product] of products.entries()) {
            
            if(processedProducts >= 5) break;
            
            console.log(`Processing Product ${index + 1}...`);
    
            try {
                let clicked = false;
                let retryCount = 0;
                while (!clicked && retryCount < 3) {
                    try {
                        await product.hover();
                        await product.click();
                        clicked = true;
                        console.log(`Clicked on product ${index + 1}`);
                    } catch (clickError) {
                        retryCount++;
                        console.log(`Retrying click for product ${index + 1} (${retryCount}/3)`);
                        await page.waitForTimeout(1000);
                    }
                }
    
                if (!clicked) {
                    console.log(`Failed to click on product ${index + 1}, skipping.`);
                    continue;
                }
    
                // Wait for sidebar
                const sidebarSelector = 'div.PshwNb';
                try {
                    await page.waitForSelector(sidebarSelector, { visible: true, timeout: 7000 });
                } catch (e) {
                    console.log(`Error: Sidebar didn't open for product ${index + 1}`);
                    continue;
                }
    
                // Ensure sidebar has new content
                try {
                    await page.waitForFunction(
                        (prevTitle) => {
                            const newTitle = document.querySelector('div[data-attrid="product_title"]')?.textContent?.trim();
                            return newTitle && newTitle !== prevTitle;
                        },
                        {},
                        previousProductTitle
                    );
                } catch (e) {
                    console.log(`Error: Sidebar content did not update for product ${index + 1}, skipping.`);
                    continue;
                }
    
                // Extract product details
                const productData = await page.evaluate(() => {
                    const stores = [];
                    const storeElements = document.querySelectorAll('div.PshwNb');
    
                    const productTitle =
                        document.querySelector('div[data-attrid="product_title"]')?.textContent?.trim() || 'No Title';
                    const productImage =
                        document.querySelector('div[jsname="figiqf"] div.DqsAAd img')?.src || '';

                    const productDescription = document.querySelector('.iERlS')?.textContent?.trim() || 'No Description Found';
    
                    storeElements.forEach((store) => {
                        const storeName =
                            store.querySelector('.hP4iBf')?.textContent?.trim() || 'Unknown Store';
                        const storeProductTitle =
                            store.querySelector('div.Rp8BL.CpcIhb.y1FcZd.rYkzq')?.textContent?.trim() || 'Unknown Product';
                        const priceElement =
                            store.querySelector('div.GBgquf.JIep9e span') ||
                            store.querySelector('span.Pgbknd.xUrPFc span');
                        const price = priceElement?.textContent?.trim() || 'No Price Found';
                        const oldPrice = store.querySelector('.AoPnCe span')?.textContent?.trim() || 'N/A';
                        // const deliveryPrice =
                        //     store.querySelectorAll('div.gASiG')[1]?.textContent?.trim() || 'N/A';

                        const deliveryPrice = store.querySelector('.OaQPmf.Z8dN6c .gASiG')?.textContent?.trim() || 'No Delivery Price Found';
                          

                        const link = store.querySelector('a')?.href || '#';
    
                        stores.push({
                            storeName,
                            storeProductTitle,
                            price,
                            oldPrice,
                            deliveryPrice,
                            link,
                        });
                    });
    
                    return {
                        title: productTitle,
                        image: productImage,
                        description:productDescription,
                        stores,
                    };
                });
    
                console.log(`Extracted Product: ${productData.title}, with ${productData.stores.length} stores.`);
                console.log("Stores: \n", productData.stores)
                console.log("-------------------------")
                // Update previous product title
                previousProductTitle = productData.title;
    
                // Prevent duplicate product entries
                if (!uniqueProducts.has(productData.title)) {
                    uniqueProducts.add(productData.title);
                    allProductsData.push(productData);
                    processedProducts++;
                } else {
                    console.log(`Duplicate product skipped: ${productData.title}`);
                }
    
                // // Close the sidebar
                // const closePanelSelector = 'span.d3o3Ad.gJdC8e.z1asCe.wuXmq';
                // if (await page.$(closePanelSelector)) {
                //     await page.click(closePanelSelector);
                //     await page.waitForTimeout(1000);
                // } else {
                //     console.log('Close button not found.');
                // }

                try {
                    await page.click('(//span[@class="d3o3Ad gJdC8e z1asCe wuXmq"])[1]');
                    await page.waitForTimeout(1000);
                  } catch (error) {
                    console.log('Close button not found.');
                  }
                  

                
            } catch (error) {
                console.log(`Error processing product ${index + 1}:`, error.message);
            }
        }
    

    
        // for (let i = 0; i < 5; i++) {
        //     console.log(`Processing Product ${i + 1}...`);
    
        //     try {
        //         products = await page.$$('div[jsname="ZvZkAe"]');
                
        //         if (i >= products.length) {
        //             console.log(`No more products to process.`);
        //             break;
        //         }
        //         await products[i].hover();

        //         // Click the product to open the sidebar
        //         await products[i].click();
        //         console.log(`Clicked on product ${i + 1}`);
    
        //         // Wait for the sidebar to load
        //         try {
        //             await page.waitForSelector('div.PshwNb', { visible: true, timeout: 5000 });
        //             console.log(`Sidebar loaded for product ${i + 1}`);
        //         } catch (e) {
        //             console.log(`Error loading sidebar for product ${i + 1}:`, e.message);
        //             continue;
        //         }
    
        //         // Extract product details
        //         const productData = await page.evaluate(() => {
        //             const stores = [];
        //             const storeElements = document.querySelectorAll('div.PshwNb');
                    
        //             // Extract main product details
        //             const productTitle = document.querySelector('div[data-attrid="product_title"]')?.textContent?.trim() || 'No Title';
        //             const productImage = document.querySelector('div[jsname="figiqf"] div.DqsAAd img')?.src || '';

        //             console.log("productTitle: ", productTitle)
    
        //             storeElements.forEach(store => {
        //                 const storeName = store.querySelector('.hP4iBf')?.textContent?.trim() || 'Unknown Store';
        //                 const storeProductTitle = store.querySelector('div.Rp8BL.CpcIhb.y1FcZd.rYkzq')?.textContent?.trim() || 'Unknown Store';
        //                 // const price = store.querySelector('div.GBgquf.wepMxd.JIep9e > span > span[aria-hidden="true"]')?.textContent?.trim() || 'N/A';
        //                 const priceElement = store.querySelector('div.GBgquf.JIep9e span, span.Pgbknd.xUrPFc span');
        //                 const price = priceElement?.textContent?.trim() || 'No Price Found';
        //                 const oldPrice = store.querySelector('.AoPnCe span')?.textContent?.trim() || 'N/A';
        //                 const deliveryPrice = store.querySelectorAll('div.gASiG')[1]?.textContent?.trim() || 'N/A';
        //                 const link = store.querySelector('a')?.href || '#';
    
        //                 stores.push({
        //                     storeName,
        //                     storeProductTitle,
        //                     price,
        //                     oldPrice,
        //                     deliveryPrice,
        //                     link
        //                 });
        //             });
    
        //             return {
        //                 title: productTitle,
        //                 image: productImage,
        //                 stores
        //             };
        //         });
    
        //         console.log(`Extracted Product: ${productData.title}, with ${productData.stores.length} stores.`);
        //         console.log("--------- Store:\n",productData.stores)
        //         // Limit the number of stores stored per product to 5
        //         productData.stores = productData.stores.slice(0, 5);
        //         allProductsData.push(productData);
    
        //         // Close the sidebar
        //         const closePanelSelector = 'span.d3o3Ad.gJdC8e.z1asCe.wuXmq'; // Replace with actual selector if needed
        //         if (await page.$(closePanelSelector)) {
        //             await page.click(closePanelSelector);
        //             await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to let the sidebar close
        //         } else {
        //             console.log('Close button not found.');
        //         }
    
        //     } catch (error) {
        //         console.log(`Error processing product ${i + 1}:`, error.message);
        //     }
    
        //     // // Stop processing if we've collected enough stores
        //     // if (allProductsData.length >= 15) {
        //     //     break;
        //     // }
        // }
    
        console.log(` ------- Total Products Collected: ${allProductsData.length}`);
        return allProductsData;
    
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
    
};

module.exports = dynamicData;