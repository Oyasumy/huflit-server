const checkCookieValid = async (page) => {
  // Goto List Control .accordion-heading a.accordion-toggle span:nth-child(2)
  await page.goto("https://portal.huflit.edu.vn/Home");
  var ck = page.url().slice(29);
  if(ck==="Home") return true;
  return false;
};

module.exports = checkCookieValid;
