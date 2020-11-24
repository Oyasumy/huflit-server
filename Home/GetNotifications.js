var data = {
  title: "Thông báo",
  data: [],
  name: "",
  mssv: 0,
};
const getNotification = async (page) => {
  try {
    await page.goto("https://portal.huflit.edu.vn/Home/index");

    // Get name
    const [el2] = await page.$x('//*[@id="menu"]/ul[2]/li/a/span[1]');
    const txtTitle = await el2.getProperty("textContent");
    const rawTitle = await txtTitle.jsonValue();

    var st = rawTitle.split("|");
    data.name = st[1].slice(1);
    data.mssv = st[0].slice(0, 10);

    // Get title table
    const titleTable = await page.evaluate(() => {
      const tds = Array.from(document.querySelectorAll("table tr"));
      return tds.map((td) => td.innerText);
    });

    data.data = convertData(titleTable);
    return data;
    // return data;
  } catch (error) {
    return null;
  }
};

//
const convertData = (arr) => {
  var result = [];
  var tt = [];
  for (let i = 1; i < arr.length; i++) {
    const element = arr[i].split("\t");
    tt.push(element);
  }
  //
  tt.forEach((element) => {
    var obj = {
      title: "",
      sender: "",
      date: "",
    };
    obj.title = element[0];
    obj.sender = element[1];
    obj.date = element[2];
    result.push(obj);
  });
  return result;
};
module.exports = getNotification;
