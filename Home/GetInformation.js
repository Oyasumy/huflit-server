var dataInformation = {
  bgTitle: "",
  img: "",
  data: [],
};
const getInformation = async (page) => {
  try {
    await page.goto("https://portal.huflit.edu.vn/Home/info");

    // Get Big Title
    const [el2] = await page.$x('//*[@id="body"]/div/div[2]/div/div[1]');
    const txtTitle = await el2.getProperty("textContent");
    const rawTitle = await txtTitle.jsonValue();
    dataInformation.bgTitle = rawTitle;

    // Get Img
    const [el] = await page.$x(
      '//*[@id="body"]/div/div[2]/div/div[2]/div[1]/div/div/img'
    );
    const srcImg = await el.getProperty("src");
    const rawSource = await srcImg.jsonValue();
    dataInformation.img = rawSource;

    // Get title
    const a_arr = await page.evaluate(() => {
      let names = document.querySelectorAll(".row .cus-header");
      let arr = Array.prototype.slice.call(names);
      let text_arr = [];
      for (let i = 0; i < arr.length; i += 1) {
        text_arr.push(arr[i].innerHTML);
      }
      return text_arr;
    });

    // Convert data
    var newArray = parseArray(a_arr);

    // Get content of title
    const a_arr2 = await page.evaluate(() => {
      let names = document.querySelectorAll(".row .cus-boder");
      let arr = Array.prototype.slice.call(names);
      let text_arr = [];
      for (let i = 0; i < arr.length; i += 1) {
        // var newTxt=arr[i].in.split(':');
        text_arr.push(arr[i].innerHTML);
      }
      return text_arr;
    });
    var newArray2 = parseArray(a_arr2);
    var rawArray = convertData(newArray2);
    dataInformation.data = rawArray;
    //   console.log(dataInformation);
    return dataInformation;
  } catch (error) {
    return 1;
  }
};

const parseArray = (arr) => {
  var newArr = [];
  for (let i = 0; i < arr.length; i++) {
    var temp = arr[i].split("\n");
    if (temp.length >= 1) {
      for (let j = 0; j < temp.length; j++) {
        var newStr = "";
        var txt = temp[j].split(" ");
        txt.forEach((element) => {
          if (element.length > 0) {
            newStr += element + " ";
          }
        });
        if (newStr.length > 0) {
          newArr.push(newStr);
        }
      }
    }
  }
  return newArr;
};
const convertData = (arr) => {
  var a_arr = [];
  arr.forEach((element) => {
    var obj = {
      title: "",
      content: "",
    };
    // var ts=element.split("type");
    // console.log(ts.length);
    if (element.split("type").length === 1) {
      var s = element.split(":");

      var txt = s[1]
        .split(/<[a-zA-Z0-9]*>([^<.*>;]*)<\/[a-zA-Z0-9]*>/gim)
        .filter((x) => x.trim() !== "");
      obj.title = s[0];

      if (txt.length > 0) {
        var checkTag = txt[0].split("label");
        if (checkTag.length > 1) {
          var rawTxt = checkTag[1].slice(1, checkTag[1].length - 2);
          obj.content = rawTxt || "";
        } else {
          obj.content = txt[0] || "";
        }
      } else {
        obj.content = txt[0] || "";
      }
      a_arr.push(obj);
    }
  });
  return a_arr;
};
module.exports = getInformation;
