const puppeteerCore = require("puppeteer-core");

(async () => {
  const browser = await puppeteerCore.launch();
  console.log(await browser.version());
  await browser.close();
})();
