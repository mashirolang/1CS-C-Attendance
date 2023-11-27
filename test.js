const moment = require("moment");

let test1 = moment("2023-11-27T11:19:46+08:00");
let test2 = moment("2023-11-27T11:19:47+08:00");

console.log(Math.abs(test1 - test2));
