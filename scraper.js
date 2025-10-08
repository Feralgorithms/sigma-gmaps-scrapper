const puppeteer = require('puppeteer');
const fs = require('fs');
const { autoScroll } = require('./utils/autoScroll');
const { extractBusinessData } = require('./utils/bisnisData');

const CONFIG = {
  CONCURRENT_TABS: 10,         
  PAGE_TIMEOUT: 30000,       
  ELEMENT_TIMEOUT: 10000,     
  SCROLL_DELAY: 5000,        
  INITIAL_WAIT: 6000,         
  HEADLESS: false,            
};

const PROGRESS_FILE = 'scrape_progress.json';

function saveProgress(data, query) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ 
    data, 
    query, 
    count: data.length,
    timestamp: new Date().toISOString()
  }, null, 2));
}


// ==================== PARALLEL DETAIL SCRAPING ====================
async function scrapeDetailParallel(browser, placeLinks, maxResults, startIndex = 0, existingData = [], onProgress = console.log) {
  const results = [...existingData];
  const totalToScrape = Math.min(placeLinks.length, maxResults);
  
  for (let i = startIndex; i < totalToScrape; i += CONFIG.CONCURRENT_TABS) {
    const batch = placeLinks.slice(i, Math.min(i + CONFIG.CONCURRENT_TABS, totalToScrape));
    
    // Scrape batch secara paralel
    const promises = batch.map(async (link, idx) => {
      const page = await browser.newPage();
      const currentIndex = i + idx;
      
      try {
        //  blocking - hanya CSS & font
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const type = req.resourceType();
          if (['stylesheet', 'font'].includes(type)) {
            req.abort();
          } else {
            req.continue();
          }
        });
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
        
        onProgress(`📍 [${currentIndex + 1}/${totalToScrape}] Processing...`);
        
        await page.goto(link, { 
          waitUntil: 'domcontentloaded', 
          timeout: CONFIG.PAGE_TIMEOUT 
        });
        
        await page.waitForSelector('h1.DUwDvf', { 
          timeout: CONFIG.ELEMENT_TIMEOUT 
        });
        
        await new Promise(resolve => setTimeout(resolve, CONFIG.INITIAL_WAIT));

        // Scroll untuk load konten & images
        await page.evaluate(() => document.querySelector('div[role="main"]')?.scrollTo(0, 400));
        await new Promise(r => setTimeout(r, CONFIG.SCROLL_DELAY));
        
        // Klik "Selengkapnya"
        try {
          const moreButtons = await page.$$('button[aria-label*="Selengkapnya"]');
          for (const btn of moreButtons) await btn.click().catch(() => {});
        } catch (e) {}

        await page.evaluate(() => document.querySelector('div[role="main"]')?.scrollTo(0, 1000));
        await new Promise(r => setTimeout(r, CONFIG.SCROLL_DELAY));

        // Extract business data (termasuk images)
        const businessData = await extractBusinessData(page);
        
        await page.close();

        if (businessData.name && businessData.latitude && businessData.longitude) {
          onProgress(`   ✅ ${businessData.name}${businessData.images ? ` (${businessData.images.length} img)` : ''}`);
          return businessData;
        } else {
          onProgress(`   ⚠️  Incomplete data, skipped`);
          return null;
        }

      } catch (err) {
        onProgress(`   ❌ Error: ${err.message}`);
        await page.close().catch(() => {});
        return null;
      }
    });
    
    // Wait semua batch selesai
    const batchResults = await Promise.all(promises);
    const validResults = batchResults.filter(d => d !== null);
    results.push(...validResults);
    
    // Auto-save progress setiap batch
    saveProgress(results, '');
    onProgress(` Progress: ${results.length} businesses saved\n`);
  }
  
  return results;
}

// ==================== MAIN FUNCTION ====================
async function scrapeGoogleMaps(searchQuery, maxResults = 20, onProgress = console.log) {
  onProgress('🚀 Memulai  Scraper...\n');
  onProgress(`⚡ Konfigurasi: ${CONFIG.CONCURRENT_TABS} parallel tabs | Headless: ${CONFIG.HEADLESS}\n`);
  

  const browser = await puppeteer.launch({
    headless: CONFIG.HEADLESS,
    executablePath: puppeteer.executablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-gpu',
      '--disable-extensions',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });

  let allBusinesses = [];

  try {
    onProgress('📍 Membuka Google Maps...');
    await page.goto('https://www.google.com/maps?hl=id', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    onProgress(`🔍 Mencari: "${searchQuery}"\n`);
    await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
    await page.click('input#searchboxinput');
    await page.type('input#searchboxinput', searchQuery, { delay: 80 });
    await page.keyboard.press('Enter');

    await page.waitForSelector('div[role="feed"]', { timeout: 20000 });
    await new Promise(resolve => setTimeout(resolve, CONFIG.INITIAL_WAIT));

    onProgress('📜 Memuat Hasil Pencarian...');
    await autoScroll(page, maxResults);

    const placeLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('div[role="feed"] a[href*="/maps/place/"]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !links.includes(href)) links.push(href);
      });
      return links;
    });

    onProgress(`✅ Menemukan ${placeLinks.length} Lokasi`);
    onProgress(`🎯 Mengestrak ${Math.min(placeLinks.length, maxResults)} detail data\n`);
    onProgress('='.repeat(70) + '\n');

    // Close list page
    await page.close();

    // Scrape details dengan parallel processing
    allBusinesses = await scrapeDetailParallel(browser, placeLinks, maxResults, 0, []);

    onProgress('FOLLOW SOSIAL MEDIA SAYA : ')
    onProgress('=>Instagram :  logikasigma')
    onProgress('=>Youtube   :  feralgorithm')
    onProgress('=>Tiktok    :  feralgorithm')
    onProgress('=>Github    :  feralgorithms')

    onProgress('\n' + '='.repeat(70));


    // Hapus progress file jika selesai
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }

    await browser.close();
    onProgress('\n✅ Scraping completed!\n');
    
    return allBusinesses;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await browser.close();
    throw error;
  }
}

module.exports = { scrapeGoogleMaps };