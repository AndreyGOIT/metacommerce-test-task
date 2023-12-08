const puppeteer = require("puppeteer-core");
const cheerio = require("cheerio");
const fs = require("fs");

const url =
  "https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();

  // Блокируем ненужные запросы
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      ["image", "stylesheet", "font", "script"].includes(request.resourceType())
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(url, { waitUntil: "load" });

  // Ждем, чтобы убедиться, что все товары загружены
  await sleep(3000);

  const products = await page.evaluate(() => {
    const data = [];
    const productNodes = document.querySelectorAll(".catalog-product");

    productNodes.forEach((node) => {
      const title = node.querySelector(".product-info__title").innerText.trim();
      const price = node
        .querySelector(".product-min-price__current")
        .innerText.trim();
      data.push({ title, price });
      console.log("Title:", title, "Price:", price);
    });

    return data;
  });

  // Записываем данные в CSV-файл
  const csvData = products
    .map((product) => `${product.title},${product.price}`)
    .join("\n");
  fs.writeFileSync("products.csv", `Title,Price\n${csvData}`);

  await browser.close();
})();
