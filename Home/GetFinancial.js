
const fs = require("fs");

const getFinancial = async (page, cookie) => {
  
  await page.goto("https://portal.huflit.edu.vn/Home/HienThiPhiHocPhan");
  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("table tr"));
    return tds.map((td) => td.innerText);
  });
  //   fs.writeFileSync("./matches.html", response.data);
  //   console.log(data);
  return convertData(data);
};

const convertData = (data) => {
  var newArr = [];

  //   total.tieuDe=data[0]
  for (let i = 0; i < data.length; i++) {
    var arr = data[i].split("\t");
    newArr.push(arr);
  }

  //
  var total = {
    tieuDe: "",
    phaiDong: 0,
    daDong: 0,
    canTru: 0,
    mienGiam: 0,
    conNo: 0,
    ngayDong: "",
    soPhieuThu: 0,
    tiLeGiam: 0,
    year: "",
    data:[]
  };
  // Parse Total
  total.tieuDe = newArr[0][0];
  total.phaiDong = newArr[0][1];
  total.daDong = newArr[0][2];
  total.canTru = newArr[0][3];
  total.mienGiam = newArr[0][4];
  total.conNo = newArr[0][5];
  total.ngayDong = newArr[0][6];
  total.soPhieuThu = newArr[0][7];
  total.tiLeGiam = newArr[0][8];
  total.year = newArr[2][0];


  var listFee = [];
  for (let i = 3; i < newArr.length - 1; i++) {
    var obj = {
      maPhi: "",
      tenPhi: "",
      phaiDong: 0,
      daDong: 0,
      canTru: 0,
      mienGiam: 0,
      conNo: 0,
      ngayDong: "",
      soPhieuThu: 0,
      tiLeGiam: 0,
      year: "",
    };
    // console.log(t2[i]);

    obj.maPhi = Number.parseInt(newArr[i][0]) || "";
    obj.tenPhi = newArr[i][1];
    obj.phaiDong = newArr[i][2];
    obj.daDong = newArr[i][3];
    obj.canTru = newArr[i][4];
    obj.mienGiam = newArr[i][5];
    obj.conNo = newArr[i][6];
    obj.ngayDong = newArr[i][7];
    obj.soPhieuThu = newArr[i][8];
    obj.tiLeGiam = newArr[i][9];

    listFee.push(obj);
  }
  total.data=listFee;

  return total;

};
module.exports = getFinancial;
