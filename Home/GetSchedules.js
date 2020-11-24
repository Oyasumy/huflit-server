const axios = require("axios").default;
var tabletojson = require("tabletojson").Tabletojson;

const getSchedules = async (cookie, year, tern, weekChoose, page) => {
  // Get week
  axios.defaults.timeout = 3000;
  var listWeek = await axios
    .get(`https://portal.huflit.edu.vn/Home/GetWeek/${year}$${tern}`, {
      headers: {
        cookie: cookie,
      },
      timeout: 6000,
    })
    .catch((err) => {
      console.log(err);
    });
  var rawWeek = listWeek.data[weekChoose].Week;

  // console.log(listWeek);
  var result = await getListSchedule(year, tern, rawWeek, cookie, page);

  // console.log(aa);
  return result;
};

const getListSchedule = async (year, tern, week, cookie, page) => {
  var response = await axios
    .get(
      `https://portal.huflit.edu.vn/Home/DrawingSchedules?YearStudy=${year}&TermID=${tern}&Week=${week}&t=0.6385974967652599`,
      {
        headers: {
          cookie: cookie,
        },
        timeout: 2000,
      }
    )
    .catch((error) => {
      console.log(error);
      return error;
    });

  var tablesAsJson = await tabletojson.convert(response.data);

  var arr = await parseObj(getRawData(tablesAsJson[0]));

  // Get title
  await page.goto(
    `https://portal.huflit.edu.vn/Home/DrawingSchedules?YearStudy=${year}&TermID=${tern}&Week=${week}&t=0.6385974967652599`
  );
  await page.waitForSelector(".smallTxt > strong ");
  let element = await page.$(".smallTxt > strong ");
  let value = await page.evaluate((el) => el.textContent, element);

  // console.log(value);
  var obj = {
    title: value,
    list: arr,
  };
  return obj;
};

const getRawData =  (data) => {
  // console.log(data);
  var arr = [];
   data.forEach((element) => {
    var newData = Object.values(element);
    // console.log(newData);
    newData.forEach((text) => {
      if (text.length > 2) {
        arr.push(text);
      }
    });
  });
  var unique =  arr.filter(function (elem, index, self) {
    return index === self.indexOf(elem);
  });
  return unique;
    // console.log(arr);
};

const parseObj =  (arr) => {
  var ar = [];
   arr.forEach((element) => {
    var obj = {
      maPhong: 0,
      tenPhong: "",
      LHP: 0,
      soTiet: 0,
      tiet: "",
      GV: "",
    };
    let newStr = "";
    if (element.slice(0, 1) === "P") {
      obj.maPhong = element.slice(0, 4);
      newStr = element.slice(4);
    } else {
      obj.maPhong = element.slice(0, 3);
      newStr = element.slice(3);
    }
    var s1 = newStr.split("GV:");
    obj.GV = s1[1].slice(1);
    var s2 = s1[0].split("Tiết");
    obj.tiet = s2[1].slice(1).slice(1);
    var s3 = s2[0].split("Số tiết:");
    obj.soTiet = Number.parseInt(s3[1]);
    var s4 = s3[0].split("LHP:");
    obj.LHP = Number.parseInt(s4[1]);
    obj.tenPhong = s4[0];

    ar.push(obj);
  });

  return ar;
};

module.exports = getSchedules;
