const getNav = async (page,dataHome) => {

  // Convert data to Array
  const a_arr = await page.evaluate(() => {
    let names = document.querySelectorAll(
      ".accordion-heading a.accordion-toggle span:nth-child(2)"
    );
    let arr = Array.prototype.slice.call(names);
    let text_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
      text_arr.push(arr[i].innerHTML);
    }
    return text_arr;
  });
  //   dataHome.listControl = a_arr;
  // Get list href
  // way 1
  const listHref = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(".accordion-inner >.row ul li a"),
      (a) => a.getAttribute("href")
    )
  );

  // Get count Each Node
  const getCountList = await page.evaluate(() => {
    var obj = [];

    for (let index = 0; index < 3; index++) {
      let countEach = document.querySelectorAll(".accordion-inner >.row ul")[
        index
      ].childElementCount;
      obj.push(parseInt(countEach));
    }
    return obj;
  });

  // Get list in Control

  const listCol = await page.evaluate(() => {
    let names = document.querySelectorAll(".accordion-inner >.row ul li a");
    let arr = Array.prototype.slice.call(names);
    let text_arr = [];
    for (let i = 0; i < arr.length; i += 1) {
      text_arr.push(arr[i].innerHTML);
    }
    return text_arr;
  });

  var newList = convertDataToArray(getCountList, listCol);
  var newHrefList = convertDataToArray(getCountList, listHref);
  var newControlList = addToList(a_arr, newList, newHrefList);
  dataHome.listControl = newControlList;
//   console.log(newControlList[1]);
};

const convertDataToArray = (eachList, listCol) => {
  var arr = [];
  var end = 0;
  var start = 0;
  for (let i = 0; i < eachList.length; i++) {
    var tt = parseInt(eachList[i]);
    end = parseInt(end + tt);
    var arr2 = [];
    for (let index = start; index < end; index++) {
      if (index < end) {
        arr2.push(listCol[index]);
      }
    }
    arr.push(arr2);
    start = end;
  }
  return arr;
};
const addToList = (name, value, listHref) => {
  // console.log(name,value);
  var arr = [];
  for (let index = 0; index < name.length; index++) {
    var arr2 = [];
    // debugger;
    for (let j = 0; j < value[index].length; j++) {
      var obj = {
        title: value[index][j],
        link: listHref[index][j],
      };
      arr2.push(obj);
    }
    // arr2.push(value[i]);
    // arr.push(arr2);
    var newObj = {
      title: name[index],
      data: arr2,
    };
    arr.push(newObj);
  }
  return arr;
};
module.exports = getNav;
