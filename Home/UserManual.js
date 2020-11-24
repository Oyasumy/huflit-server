var data = {
  title: "",
  data: [
    {
      title: "",
      link: "",
      date: "",
    },
  ],
};
const getListManual = async (page) => {
  await page.goto("https://portal.huflit.edu.vn/News/Type/1010");

  // Get Big Title
  const [el2] = await page.$x('//*[@id="body"]/div/div[2]/div/div[1]');
  const txtTitle = await el2.getProperty("textContent");
  const rawTitle = await txtTitle.jsonValue();
  data.title = rawTitle;

  // Get content of title
  const a_arr2 = await page.evaluate(() => {
    let names = document.querySelectorAll(".divmain a");
    let arr = Array.prototype.slice.call(names);
    let text_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
      // var newTxt=arr[i].in.split(':');
      text_arr.push(arr[i].innerHTML);
    }
    return text_arr;
  });

  // Get date time
  const a_arr = await page.evaluate(() => {
    let names = document.querySelectorAll(".divmain i");
    let arr = Array.prototype.slice.call(names);
    let text_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
      // var newTxt=arr[i].in.split(':');
      text_arr.push(arr[i].innerHTML);
    }
    return text_arr;
  });

  // Get Href
  const hrefs1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".divmain a"), (a) =>
      a.getAttribute("href")
    )
  );

  data.data = convertArray(a_arr2, a_arr, hrefs1);

//   console.log(data);
    return data;
};
const convertArray = (arr, date, href) => {
  var ar = [];

  for (let index = 0; index < arr.length; index++) {
    var txt = arr[index].split("-");
    var obj = {
      title: txt[1].slice(1),
      date: date[index].slice(11),
      link: "https://portal.huflit.edu.vn" + href[index],
    };
    ar.push(obj);
  }
  return ar;
};
module.exports = getListManual;
