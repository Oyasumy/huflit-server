const getExamination = require("../Home/GetExaminations");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

process.on("message", async (message) => {
  var { cookie, year, tern } = message;
  const childProcess = await apiExamSchedule(cookie, year, tern);
  process.send(childProcess);
  process.kill();

  process.exit();
});

const apiExamSchedule = async (cookie, year, tern) => {
  // Request Exam
  var examSchedule = {
    year: year,
    tern: tern,
    data: [],
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

  await page.goto("https://portal.huflit.edu.vn/Home/", {
    waitUntil: "load",
  });
  // Goto Exam Schedule
  examSchedule.data = await getExamination(
    cookie,
    examSchedule.year,
    examSchedule.tern
  );
  // var dt=await getInformation(page)
  return examSchedule;
};

module.exports = apiExamSchedule;
