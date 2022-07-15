'use strict';
require('dotenv').config();

const { activeInternQuery } = require('./notion');
const { queryDatabase } = require('./notion');

// ############################################
// Selecting the month parameter to query the database
// ############################################
function getDate() {
  const now = new Date();
  const monthISO = new Date(now.getFullYear(), now.getMonth() - 1);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    monthISO
  );

  const year = month === 'December' ? now.getFullYear() - 1 : now.getFullYear();
  return `${month} ${year}`;
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

generateFD(getDate());
