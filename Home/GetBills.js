const getBills = async (page,year,tern) => {
  // var year = "2019-2020";
  // var tern = "HK02";
  await page.goto(
    `https://portal.huflit.edu.vn/Home/DanhSachHoaDon?YearStudy=${year}&TermID=${tern}&t=0.32270501594872836`
  );

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("table tr"));
    return tds.map((td) => td.innerText);
  });

  return convertData(data);
};


///
const convertData = (data) => {
  var arr = [];
  data.forEach((element) => {
    var x = element.split("\n");

    arr.push(x);
  });
  var arrMain = {
    arrTitle: [],
    data: [],
  };
  // console.log(arr[0][0]);

  var tt = arr[0][0].split("\t");
  var a = [];
  tt.forEach((element) => {
    a.push(element);
  });

  //   debugger;÷
  arrMain.arrTitle = [...a.slice(0, a.length - 1)];
  //   console.log(arrMain.arrTitle);

  var b = [];
  var li = {
    parent: {
      data: [],
      child: [],
    },
  };
  //   var li.parent.child = [];
  //   var li.parent.data = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] != "") {
      if (li.parent.data.length > 0) {
        arrMain.data.push(li);
        li.parent.child = [];
        li.parent.data = [];
      }

      var item = arr[i][0].split("\t");
      item.forEach((element) => {
        li.parent.data.push(element);
      });
    } else {
      // continue;

      //
      if (arr[i].length < 10) {
        var obj = {
          ma: 0,
          ten: "",
          daDong: "",
        };
        // console.log(arr[i + 1]);
        debugger;
        obj.ma = Number.parseInt(arr[i][1].slice(52)) || 0;
        obj.ten = arr[i][2].slice(52);
        obj.daDong = arr[i][3].slice(52);

        if (obj.ma !== 0) {
          li.parent.child.push(obj);
        }
      }
      //
    }
  }
  arrMain.data.push(li);

  return arrMain;
};
module.exports = getBills;
