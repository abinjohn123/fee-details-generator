'use strict';
require('dotenv').config();

const { activeInternQuery } = require('./notion');
const { queryDatabase } = require('./notion');

// ############################################
// Selecting the month parameter to query the database
// ############################################
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function checkDate() {
  const fullDate = new Date();
  const date = 15 || fullDate.getDate();
  const month = months[fullDate.getMonth() - 1];
  const year =
    month === 'December' ? fullDate.getFullYear() - 1 : fullDate.getFullYear();

  console.log(`Full Date: ${fullDate}`);

  if (date === 15) generateFD(`${month} ${year}`);
  else console.log('not today!');
}

// ############################################
// Querying the databases
// ############################################
async function generateFD(month) {
  const CWArray = await activeInternQuery();

  for (const obj of CWArray) {
    [obj.results, obj.total] = await queryDatabase(obj.name, month);
  }

  CWArray.forEach((obj) => {
    console.log(obj);
  });
}

checkDate();
const timer = setInterval(checkDate, 1000 * 60 * 60 * 24);
