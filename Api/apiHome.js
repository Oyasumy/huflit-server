const getNotification = require("../Home/GetNotifications");
const puppeteer = require("puppeteer");
const checkCookieValid = require("../commons");

const axios = require("axios").default;

process.on("message", async (message) => {
  try {
    var { cookie } = message;
    const childProcess = await apiHome(cookie);
    process.send(childProcess);
    process.kill();

    process.exit();
  } catch (error) {
    throw error;
  }
});

const apiHome = async (cookie) => {
  try {
    var dataHome = {
      message: {},
      notification: [],
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

    // Get GetNotificationAccountFee
    axios
      .get("https://portal.huflit.edu.vn/Home/GetNotificationAccountFee", {
        headers: {
          cookie: cookie,
        },
        timeout: 2000,
      })
      .then((res) => {
        //   console.log(res.data);
        dataHome.message = res.data;
      })
      .catch((error) => {
        console.log(error);
      });

    await page.goto("https://portal.huflit.edu.vn/Home/", {
      waitUntil: "load",
    });
    console.log(page.url());

    //  Goto Information
    // dataHome.information = await getInformation(page);

    //  Goto Information
    dataHome.notification = await getNotification(page);

    //  Goto User Manual
    // dataHome.userManual = await getListManual(page);

    //  Goto Education Program
    // dataHome.educationProgram = await getEducationProgram(page, cookie);

    // console.log(dataHome);
    return dataHome;
  } catch (error) {
    throw error;
  }
};

module.exports = apiHome;
