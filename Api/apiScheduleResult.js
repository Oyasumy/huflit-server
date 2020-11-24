const getRegistrationResult = require("../Home/GetRegistRationResult");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

process.on("message", async (message) => {
  var { cookie, year, tern } = message;
  const childProcess = await apiScheduleResult(cookie, year, tern);
  process.send(childProcess);
  process.kill();

  process.exit();
});

const apiScheduleResult = async ( cookie,year,tern) => {

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
  var ck=await checkCookieValid(page);
  if(ck ===false) return -1;
  // Goto Registration Result
  var registrationResult = await getRegistrationResult(page,year,tern);

  return registrationResult
};

module.exports =  apiScheduleResult;
