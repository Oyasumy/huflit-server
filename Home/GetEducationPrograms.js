const axios = require("axios");
var tabletojson = require("tabletojson").Tabletojson;

var data = {
  bigTitle: "",
  title: "",
  dataTable: [],
};
const getEducationProgram = async (page, cookie) => {
  await page.goto("https://portal.huflit.edu.vn/Home/StudyPrograms");

  // Get Big Title
  const [el2] = await page.$x('//*[@id="body"]/div/div[2]/div/div[1]');
  const txtTitle = await el2.getProperty("textContent");
  const rawTitle = await txtTitle.jsonValue();

  data.bigTitle = rawTitle;

  // Get Major
  const a_arr = await page.evaluate(() => {
    let names = document.querySelectorAll(".divmain option");
    let arr = Array.prototype.slice.call(names);
    let text_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
      text_arr.push(arr[i].innerHTML);
    }
    return text_arr;
  });
  data.title = a_arr;

  // Get title table
  const titleTable = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("div#divStudyProgams th"));
    return tds.map((td) => td.innerText);
  });

  // Get data table

  var rawSource = [];
  var response = await axios
    .get(
      "https://portal.huflit.edu.vn/API/Student/StudyPgrograms/PM17?t=0.9576715890203387",
      {
        headers: {
          cookie: cookie,
        },
        timeout: 2000,
      }
    )
    .catch((error) => {
      console.log(error);
    });
  var tablesAsJson = tabletojson.convert(response.data);
  rawSource = await convertTable(tablesAsJson[0]);
  // .then(async (res) => {
  //   //   const jsonTables = HtmlTableToJson.parse(res.data);
  //   var tablesAsJson = tabletojson.convert(res.data);
  // var tablesAsJson = HtmlTableToJson.parse(res.data);
  // console.log(tablesAsJson[0]);
  // console.log(rawSource);
  // })
  //   console.log(await page.url());
  // console.log(rawSource);
  data.dataTable = rawSource;

  return data;
};
const convertTable = async (table) => {
  // var part = table[0].LT;
  var arr = [];
  let arr2 = [];
  for (let i = 0; i < table.length; i++) {
    if (table[i].LT.includes("Học kỳ")) {
      if (arr2.length > 0) {
        arr.push(arr2);
      }
      arr2 = [];
    }
    arr2.push(table[i]);
  }
  await arr.push(arr2);

  // console.log(arr);

  const resultArray = [];
  for (let j = 0; j < arr.length; j++) {
    let newData = {
      year: "",
      obligatory: {
        list: [],
        total: 0,
      },

      elective: {
        list: [],
        total: 0,
      },
    };
    // newData = { ...newData };
    var target = false;
    for (let i = 2; i < arr[j].length; i++) {
      newData.year = arr[j][0].LT;
      var ob = {
        stt: 0,
        code: 0,
        tenHP: "",
        tinChi: 0,
        soTiet: {
          TH: 0,
          LT: 0,
        },
        tienQuyet: "",
        hocTruoc: "",
        boMon: "",
      };
      // Tong tin chi bat buoc
      if (arr[j][i].LT.includes("Cộng học phần Bắt Buộc")) {
        newData.obligatory.total = Number(arr[j][i].TH) || 0;
        continue;
      }
      // Tong tin chi tu chon
      if (arr[j][i].LT.includes("Cộng học phần Tự Chọn")) {
        newData.elective.total = Number(arr[j][i].TH) || 0;
        continue;
      }
      // Con lai
      ob.stt = Number(arr[j][i].LT) || 0;
      ob.code = Number(arr[j][i].TH) || 0;
      ob.tenHP = arr[j][i]["TÊN HỌC PHẦN"];
      ob.tinChi = Number(arr[j][i]["SỐ TC"]) || 0;
      ob.soTiet.LT = Number(arr[j][i]["SỐ TIẾT"]) || 0;
      ob.soTiet.TH = Number(arr[j][i]["HỌC PHẦN TIÊN QUYẾT"]) || 0;
      ob.tienQuyet = arr[j][i]["HỌC PHẦN HỌC TRƯỚC"];
      ob.hocTruoc = arr[j][i]["KHOA/BỘ MÔN"];
      ob.boMon = arr[j][i]["8"];

      if (arr[j][i].LT.includes("Tự Chọn")) {
        target = true;
        continue;
      }

      // Them tu chon
      if (target) {
        newData.elective.list.push(ob);
        // Them Bat Buoc
      } else {
        newData.obligatory.list.push(ob);
      }
    }
    await resultArray.push({ ...newData });
  }
  // console.log(resultArray[4]);
  // console.log(arr[6]);
  // console.log(resultArray);
  return resultArray;
};
module.exports = getEducationProgram;
