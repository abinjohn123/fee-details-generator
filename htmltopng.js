const puppeteer = require('puppeteer');

const htmltopng = async (html = ' ') => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let imageBuffer;

  await page.setViewport({ width: 500, height: 800, deviceScaleFactor: 3 });

  await page.setContent(`data: text/html, ${html}`, {
    waitUntil: 'networkidle0',
  });

  const content = await page.$('.card');
  imageBuffer = await content.screenshot({ omitBackground: true });

  await page.close();
  await browser.close();
  return imageBuffer;
};

module.exports = {
  htmltopng,
};
