const getEducationProgram = require("../Home/GetEducationPrograms");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

process.on("message", async (message) => {
  const childProcess = await apiEducationProgram(message.data);
  process.send(childProcess);
  process.kill();

  process.exit();
});

const apiEducationProgram = async (cookie) => {
  var as = cookie.split("=");

  const COOKS = [
    {
      name: as[0],
      value: as[1],
      domain: "portal.huflit.edu.vn",
      path: "/",
      expires: -1,
      size: 24,
      httpOnly: false,
      secure: false,
      session: true,
    },
  ];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCookie(...COOKS);

  // Check validCookie
  var ck = await checkCookieValid(page);
  if (ck === false) return -1;

  return await getEducationProgram(page, cookie);
};

module.exports = apiEducationProgram;
