'use strict';
require('dotenv').config();

const { activeInternQuery } = require('./app/notion');
const { queryDatabase } = require('./app/notion');
const { htmltopng } = require('./app/htmltopng');
const fs = require('fs');

// ############################################
// Generating MONTH value to query database
// ############################################
function getMonth() {
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
  const contractWorkersArray = await activeInternQuery();

  for (const obj of contractWorkersArray) {
    [obj.results, obj.total] = await queryDatabase(obj.name, month);
    const imageBuffer = await htmltopng(returnTableHTML(obj));

    fs.writeFileSync(
      `./Fee-Details/${obj.name}--Fee Details--${month}.png`,
      imageBuffer
    );
  }
}

const returnTableHTML = function (CWObj) {
  let htmlString = `
    <!DOCTYPE html>
    <html>
      <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
      href="https://fonts.googleapis.com/css2?family=Poiret+One&display=swap"
      rel="stylesheet"
      />
      <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Ubuntu:wght@400;500;700&display=swap"
      rel="stylesheet"
      />
      <style>
      ${fs.readFileSync(`app/fee-details-styles.css`, 'utf8')}
      </style>  
      </head>
    <body>
    <div class="card">
    <div class="card-header">
      <span>Name: </span>
      <span>${CWObj.name}</span>
      <hr />
      <span>Details For:</span>
      <span>${getMonth()}</span>
    </div>
    <div class="card-body">
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Fee (Rs.)</th>
          </tr>
        </thead>
        <tbody>`;

  for (let i = 0; i < CWObj.results.length; ++i) {
    htmlString += `
          <tr>
            <td>${CWObj.results[i].project}</td>
            <td>${CWObj.results[i].fee}</td>
          </tr> `;
  }

  htmlString += `
        </tbody>
      </table>
    </div>
    <div class="card-total">
      <span>Total:</span>
      <span>Rs. ${CWObj.total}</span>
    </div>
    <div class="card-footer">
    <span>hophead</span>
  </div>
  </div>
    </body>
    </html>`;

  return htmlString;
};

generateFD(getMonth());
