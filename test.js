const moment = require("moment");

let test1 = moment("2023-11-27T15:23:22.000Z");
let test2 = moment("2023-11-27T16:23:22.000Z");

console.log(Math.abs(test1 - test2));
