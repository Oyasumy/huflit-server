const axios = require("axios").default;
var tabletojson = require("tabletojson").Tabletojson;

const getExamination = async ( cookie, year, tern) => {
  var response = await axios
    .get(
      `https://portal.huflit.edu.vn/Home/ShowExam?YearStudy=${year}&TermID=${tern}&t=0.9264167694010692`,
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
  var tablesAsJson = tabletojson.convert(response.data);

  //   var arr = await (tablesAsJson[0]);

  return convertData(tablesAsJson[0]);
};

const convertData = (arr) => {
  var result = [];
  arr.forEach((element) => {
    var obj = {
      maHP: 0,
      tenHP: "",
      STC: 0,
      ngThi: 0,
      gioThi: 0,
      phgThi: 0,
      thGian: 0,
      diaDiem: "",
      ghiChu: "",
    };
    obj.maHP = Number.parseInt(element["Mã học phần"]);
    obj.tenHP = element["Tên học phần"];
    obj.STC = Number.parseInt(element.STC);
    obj.ngThi = element["Ngày thi"];
    obj.gioThi = element["Giờ thi"];
    obj.phgThi = element["Phòng thi"];
    obj.thGian = Number.parseInt(element["Thời lượng (phút)"]);
    obj.diaDiem = element["Địa điểm"];
    obj.ghiChu = element["Ghi chú"];

    result.push(obj);
  });
  return result;
};
module.exports = getExamination;
