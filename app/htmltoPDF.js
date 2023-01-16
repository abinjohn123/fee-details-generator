const puppeteer = require('puppeteer');

const htmltoPDF = async (html = ' ') => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // await page.setViewport({ width: 500, height: 800, deviceScaleFactor: 3 });

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  });

  await page.addStyleTag({ path: './app/stub.css' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await page.close();
  await browser.close();
  return pdfBuffer;

  // return true;
};

module.exports = {
  htmltoPDF,
};
