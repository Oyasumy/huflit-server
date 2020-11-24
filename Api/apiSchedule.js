const getSchedules = require("../Home/GetSchedules");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

process.on("message", async (message) => {
  var { cookie, year, tern, weekChoose } = message;
  const childProcess = await apiSchedule(cookie, year, tern, weekChoose);
  process.send(childProcess);
  process.kill();

  process.exit();
});

const apiSchedule = async (cookie, year, tern, wk) => {
  // Request Schedule
  var objSchedule = {
    year: year,
    tern: tern,
    data: [],
    weekChoose: wk,
  };

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

  try {
    objSchedule.data = await getSchedules(
      cookie,
      objSchedule.year,
      objSchedule.tern,
      objSchedule.weekChoose,
      page
    );
  } catch (error) {
    return 1;
  }
  // Goto Schedule

  return objSchedule;
};

module.exports = apiSchedule;
