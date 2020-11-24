const getRegistrationResult = async (page,year,tern) => {

  await page.goto(
    `https://portal.huflit.edu.vn/Home/XemKetQuaDangKyHP?YearStudy=${year}&TermID=${tern}`
  );

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("table tr"));
    return tds.map((td) => td.innerText);
  });

  //   console.log(data);
  return convertData(data);
};

// Function
const convertData = (data) => {
  var arr = [];
  for (let i = 1; i < data.length; i++) {
    arr.push(data[i].split("\t"));
  }
  //
  var rawA=[];
  arr.forEach((element) => {
    var result = {
      stt: 0,
      maHocPhan: 0,
      tenHocPhan: "",
      STC: 0,
      Ngay: "",
    };

    result.stt = Number.parseInt(element[0]);
    result.maHocPhan = Number.parseInt(element[1]);
    result.tenHocPhan = element[2];
    result.STC = Number.parseInt(element[3]);
    result.Ngay = element[4];

    rawA.push(result);
  });
  return(rawA);
};
module.exports = getRegistrationResult;
