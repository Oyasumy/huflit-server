const getStudentDecision = async (page) => {
  await page.goto("https://portal.huflit.edu.vn/Home/Decisions");
  const result = await page.$$eval(".divmain tr", (rows) => {
    return Array.from(rows, (row) => {
      const columns = row.querySelectorAll("td");
      return Array.from(columns, (column) => column.innerText);
    });
  });
  var newArr = result.slice(1);
  //   console.log(newArr);
  return convertData(newArr);
};

const convertData = (arr) => {
  var result = [];
  var temp = [];
  arr.forEach((element) => {
    var obj = Object.assign({}, element);
    temp.push(obj);
  });
  temp.forEach((element) => {
    var obj = {
      namHoc: 0,
      hocKi: "",
      soQuyetDinh: "",
      loaiQuyetDinh: "",
      noiDung: "",
      nguoiKy: "",
      ngayKy: "",
    };
    obj.namHoc = Number.parseInt(element["0"]);
    obj.hocKi = element["1"];
    obj.soQuyetDinh = element["2"];
    obj.loaiQuyetDinh = element["3"];
    obj.noiDung = element["4"];
    obj.nguoiKy = element["5"];
    obj.ngayKy = element["6"];

    result.push(obj);
  });

  return result;
};
module.exports = getStudentDecision;
