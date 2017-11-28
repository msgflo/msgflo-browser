const puppeteer = require('puppeteer');
const url = 'http://localhost:3000/examples/infodisplay/index.html?msgflo_broker=mqtt://localhost&msgflo_role=display'

puppeteer.launch()
  .then((browser) => browser.newPage())
  .then((page) => page.goto(url))
  .then(() => {
    console.log('Ready!');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
