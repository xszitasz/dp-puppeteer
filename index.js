const puppeteer = require('puppeteer');
const { login, fillForm } = require('./methods');
const getUsers = require('./userDb');
const CustomError = require('./customError.js');

(async () => {
  let customError, retryCount = 2;
  const startTime = Date.now();
  const userData = await getUsers();

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    defaultViewport: null,
    headless: false,
    ignoreDefaultArgs: [],
    timeout: 3000,
    args: ['--no-sandbox', '--start-maximized']
  });

  const pages = await browser.pages();
  const blankPage = pages[0];

  while(retryCount > 0) {
    try {
      await blankPage.close();
  
      const mainPage = await browser.newPage();
      await mainPage.goto("https://www.diportal.sk/statistika/nahlasovanie");
      await login(mainPage, userData, startTime);
      await fillForm(mainPage, startTime);
  
      customError = new CustomError('Report insert success code', 0x0);
      break;
    } catch (err) {
      retryCount--;
      customError = new CustomError('Report insert failure code', 0x1);
      console.error(err);
    } finally {
      customError.exitProcess();
      await browser.close();
    }
  }
})();