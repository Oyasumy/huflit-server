const getFinancial = require("../Home/GetFinancial");
const getStudentDecision = require("../Home/GetStudentDecision");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

process.on("message", async (message) => {
  var { cookie } = message;
  const childProcess = await apiLast(cookie);
  process.send(childProcess);
  process.kill();

  process.exit();
});

const apiLast = async (cookie) => {
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

  // Request Decision
  var studentDecision = [];

  // Goto Student Decision
  studentDecision = await getStudentDecision(page);

  // Goto Student Fees
  var result = await getFinancial(page, cookie);

  var allData = {
    studentDecision: studentDecision,
    fees: result,
  };
  return allData;
};

module.exports = apiLast;
