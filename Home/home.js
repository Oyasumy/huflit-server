const { a_arr } = require("../commons");
const getBills = require("./GetBills");
const getEducationProgram = require("./GetEducationPrograms");
const getExamination = require("./GetExaminations");
const getFinancial = require("./GetFinancial");
const getInformation = require("./GetInformation");
const getNav = require("./GetNav");
const getNotification = require("./GetNotifications");
const getRegistrationResult = require("./GetRegistRationResult");
const getSchedules = require("./GetSchedules");
const getStudentDecision = require("./GetStudentDecision");
const getListManual = require("./UserManual");
const axios = require("axios").default;

const getApiNav = async (page, cookie) => {
  var dataHome = {
    message: {},
    listControl: [],
    information: [],
    notification: [],
    userManual: [],
    educationProgram: [],
  };

  
  // Request Schedule
  var objSchedule = {
    year: "2020-2021",
    tern: "HK01",
    data: [],
    weekChoose: 7,
  };

  // Request Exam
  var examSchedule = {
    year: "2019-2020",
    tern: "HK01",
    data: [],
  };

  // Request Decision
  var studentDecision = [];

  //   var { message, listControl } = dataHome;

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

  // Goto List Control .accordion-heading a.accordion-toggle span:nth-child(2)
  await page.goto("https://portal.huflit.edu.vn/Home/");
  console.log(page.url());

  await getNav(page, dataHome);

  //  Goto Information
  dataHome.information = await getInformation(page);

  //  Goto Information
  dataHome.notification = await getNotification(page);

  //  Goto User Manual
  dataHome.userManual = await getListManual(page);

  //  Goto Education Program
  dataHome.educationProgram = await getEducationProgram(page, cookie);

  // Goto Schedule
  objSchedule.data = await getSchedules(
    page,
    cookie,
    objSchedule.year,
    objSchedule.tern,
    objSchedule.weekChoose
  );

  // Goto Exam Schedule
  examSchedule.data = await getExamination(
    page,
    cookie,
    examSchedule.year,
    examSchedule.tern
  );

  // Goto Student Decision
  studentDecision = await getStudentDecision(page);

  // Goto Student Fees
  var result =await getFinancial(page,cookie);

  // Goto Get Bill 
  var bills=await getBills(page);

  // Goto Registration Result
  var registrationResult=await getRegistrationResult(page);
  // console.log(registrationResult);
  var allData={
    dataHome:dataHome,
    objSchedule:objSchedule,
    examSchedule:examSchedule,
    studentDecision:studentDecision,
    fees:result,
    bills:bills,
    regisTrationResult:registrationResult
  }
  // return dataHome;
};

module.exports.getApiHome = getApiNav;
