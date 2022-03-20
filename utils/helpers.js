const moment = require("moment");

function currentDate() {
  const time = moment().format("Do MMM YYYY");
  return time;
}

module.exports = { currentDate };
