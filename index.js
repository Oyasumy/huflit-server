const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const puppeteer = require("puppeteer");
const apiHome = require("./Api/apiHome");
const { fork } = require("child_process");
const fs = require("fs");
const path = require("path");
const xss = require("xss");

let accessStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

require("events").EventEmitter.prototype._maxListeners = 100;
const app = express();
app.use(cors());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Set limit ip request in 1h
const createRequestLimiter = rateLimit({
  windowMs: 500, // 0.5s  window
  max: 1, // start blocking after 1 requests
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

// Config request
const rateLimiter = new RateLimiterMemory({
  points: 15,
  duration: 15, // per 10 seconds
});

const rateLimiterMiddleware = (req, res, next) => {
  // const userId = getUserId();
  // Consume 1 point for each action
  rateLimiter
    .consume(req.ip) // or req.ip
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      res.status(429).send("Too Many Requests");
    });
};
const checkXss = (source) => {
  var html = xss(source, {
    whiteList: [], // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ["script"], // the script tag is a special case, we need
    // to filter out its content
  });
  console.log(source, html);
  if (Object.keys(source).length > Object.keys(html).length) return false;
  return true;
};

app.get("/", (req, res) => {
  return res.json({ msg: "halo" });
});
// Get Data Home
app.post("/getApiHome", createRequestLimiter, async function (req, res) {
  try {
    console.log("--------------------------------");
    console.log(req.body);
    if (
      req.body.user === "undefined" ||
      req.body.pass === "undefined" ||
      !checkXss(req.body.user) ||
      !checkXss(req.body.pass)
    ) {
      return res.status(400).send({ mess: "failed" });
    }
    var { user, pass } = req.body;

    var ck = await getApi(user, pass);

    const childProcess = fork("./Api/apiHome");
    childProcess.send({ cookie: ck });
    childProcess.on("message", (message) => {
      // Check cookie validity
      if (message === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      // return res.send(message);
      return res.status(200).set("cookie", ck).send(message);
    });
  } catch (error) {
    return res.status(500).send({ mess: error });
  }
});

// Get Information Student
app.get("/getApiInformation", createRequestLimiter, async function (req, res) {
  try {
    var cookie = req.headers.cookie;
    console.log("--------------------------------");

    if (cookie === "undefined" || cookie === "null" || !cookie) {
      console.log("fail");
      return res.status(400).send({ mess: "failed" });
    }

    console.log("req", cookie, req.url);

    const childProcess = fork("./Api/apiInformation");
    childProcess.send({ data: cookie });
    childProcess.on("message", (message) => {
      // Check cookie validity
      if (message === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      if (message === 1) {
        return res.status(400).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(message);
    });
    // childProcess.kill();
  } catch (error) {
    return res.status(500).send({ mess: error });
  }
});

// Get Education Program
app.get(
  "/getApiEducationProgram",
  createRequestLimiter,
  async function (req, res) {
    try {
      console.log("--------------------------------");
      var cookie = req.headers.cookie;
      if (cookie === "undefined" || cookie === "null") {
        return res.status(400).send({ mess: "failed" });
      }
      console.log("req", cookie, req.url);

      const childProcess = fork("./Api/apiEducationProgram");
      childProcess.send({ data: cookie });
      childProcess.on("message", (data) => {
        // Check cookie validity
        if (data === -1) {
          return res.status(403).send({ mess: "invalidCookie" });
        }
        return res.status(200).send(data);
      });
    } catch (error) {
      return res.status(500).send({ mess: error });
    }
  }
);

// Get User Manual
app.get("/getApiUserManual", createRequestLimiter, async function (req, res) {
  try {
    var cookie = req.headers.cookie;
    console.log("--------------------------------");
    if (cookie === "undefined" || cookie === "null") {
      return res.status(400).send({ mess: "failed" });
    }
    console.log("req", cookie, req.url);

    const childProcess = fork("./Api/apiUserManual");
    childProcess.send({ data: cookie });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ mess: error });
  }
});

// Get Schedule Exam
app.post("/getexamschedule", rateLimiterMiddleware, async (req, res) => {
  try {
    console.log("--------------------------------");
    var { year, tern } = req.body;
    var cookie = req.headers.cookie;

    if (
      year === "undefined" ||
      cookie === "undefined" ||
      cookie === "null" ||
      tern === "undefined" ||
      !checkXss(year) ||
      !checkXss(tern)
    ) {
      return res.status(400).send({ mess: "failed" });
    }

    const childProcess = fork("./Api/apiExamSchedule");
    childProcess.send({ cookie, year, tern });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ err: error });
  }
});

// Get Schedule
app.post("/getschedule", rateLimiterMiddleware, async (req, res) => {
  try {
    console.log("--------------------------------");
    req.connection.setTimeout(1000 * 60 * 30);

    // var { year, tern, weekChoose } = req.body;
    var { year, tern, weekChoose } = req.body.data;

    var cookie = req.body.header.cookie;
    // var cookie = req.headers.cookie;
    if (
      year === "undefined" ||
      cookie === "undefined" ||
      cookie === "null" ||
      tern === "undefined" ||
      weekChoose === "undefined" ||
      !checkXss(tern) ||
      !checkXss(yearn) ||
      !checkXss(weekChoose)
    ) {
      return res.status(400).send({ mess: "failed" });
    }
    console.log("req", cookie, year, tern, weekChoose);

    // fork request to multiple process
    const childProcess = fork("./Api/apiSchedule");
    childProcess.send({ cookie, year, tern, weekChoose });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      if (data === 1) {
        return res.status(500).send({ mess: "Error sever!" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ err: error });
  }
});

// Get Schedule Result
app.post("/getscheduleresult", rateLimiterMiddleware, async (req, res) => {
  try {
    console.log("--------------------------------");
    var { year, tern } = req.body;
    var cookie = req.headers.cookie;
    if (
      year === "undefined" ||
      tern === "undefined" ||
      cookie === "undefined" ||
      cookie === "null" ||
      !checkXss(tern) ||
      !checkXss(year)
    ) {
      return res.status(400).send({ mess: "failed" });
    }
    console.log("req", cookie, year, tern);

    // fork request to multiple process
    const childProcess = fork("./Api/apiScheduleResult");
    childProcess.send({ cookie, year, tern });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ err: error });
  }
});

// GEt Bills
app.post("/getbills", createRequestLimiter, async (req, res) => {
  try {
    console.log("--------------------------------");
    var { year, tern } = req.body;
    var cookie = req.headers.cookie;
    if (
      year === "undefined" ||
      tern === "undefined" ||
      cookie === "undefined" ||
      cookie === "null" ||
      !checkXss(year) ||
      !checkXss(tern)
    ) {
      return res.send({ mess: "failed" });
    }
    console.log("req", cookie, year, tern);

    // fork request to multiple process
    const childProcess = fork("./Api/apiBills");
    childProcess.send({ cookie, year, tern });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ err: error });
  }
});

app.get("/getlast", createRequestLimiter, async (req, res) => {
  try {
    console.log("--------------------------------");
    var cookie = req.headers.cookie;
    if (!cookie || cookie === "undefined" || cookie === "null") {
      return res.status(400).send({ mess: "failed" });
    }
    console.log("req", cookie);

    // fork request to multiple process
    const childProcess = fork("./Api/apiLast");
    childProcess.send({ cookie });
    childProcess.on("message", (data) => {
      // Check cookie validity
      if (data === -1) {
        return res.status(403).send({ mess: "invalidCookie" });
      }
      return res.status(200).send(data);
    });
  } catch (error) {
    return res.status(500).send({ err: error });
  }
});

const PORT = process.env.PORT || 3104;
app.listen(PORT, () => console.log("sever is listening ..."));

const getApi = async (user, pass) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await preparePageForTests(page);
    // await browser.close();
    await page.setDefaultNavigationTimeout(0);
    console.log("start");
    await initFuc(page, user, pass);

    // Get cookie
    var cookie = await page.cookies();
    var { name, value } = cookie[0];
    console.log(name, value);

    console.log("Home loading..");
    // Home
    var tt = name + "=" + value;
    // return await apiHome(page, (cookie = name + "=" + value));
    return tt;
  } catch (error) {
    console.log(error);
    await browser.close();
  }
};

async function initFuc(page, user, pass) {
  console.log("ok", user, pass);
  await page.goto("https://portal.huflit.edu.vn/login", { waitUntil: "load" });

  //   await page.waitForSelector("input[name=txtTaiKhoan]");
  debugger;
  //   await page.$eval(
  //     "input[name=txtTaiKhoan]",
  //     (el) => (el.value = "17dh110988")
  //     // (el,user) => (el.value = `${user}`)
  //   );

  //   await page.type("#txtMatKhau", "20091999");
  await page.type("input[name=txtTaiKhoan]", `${user}`);
  await page.type("#txtMatKhau", `${pass}`);

  // Submitting
  console.log("start submit");
  await Promise.all([
    page.waitForNavigation(),
    page.click('input[type="submit"]'),
  ]);

  console.log("New Page URL:", page.url());
}
// This is where we'll put the code to get around the tests.
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);
};
