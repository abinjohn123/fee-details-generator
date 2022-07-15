'use strict';
require('dotenv').config();

const { activeInternQuery } = require('./notion');
const { queryDatabase } = require('./notion');
const { htmltopng } = require('./htmltopng');
const fs = require('fs');

// ############################################
// Selecting the month parameter to query the database
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
        * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background-color: #f7f7f7;
        font-family: 'Ubuntu', sans-serif;
        color: #d2d4d6;
      }
        .card {
          border: solid 1px #343a40;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          width: 400px;
          background-color: #f1f3f5;
          color: #212528;
          align-self: start;
          padding: 24px;
          font-size: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .card-header {
          display: grid;
          margin: 0 auto;
          width: 100%;
          grid-template-columns: 1fr auto;
          background-color: #ced4da;
          padding: 8px 16px;
          row-gap: 10px;
          border-radius: 6px;
          align-items: center;
        }

        .card-header span {
          padding: 1px 2px;
        }

        .card-header hr {
          grid-column: 1/-1;
          height: 1px;
          background-color: #fff;
        }
        .bdr-btm {
          border-bottom: 1px solid #fff;
        }

        .light-border {
          border: 1px solid #495057;
        }

        .card-body table {
          width: 100%;
          border: 1px solid #1c252e;
          border-radius: 8px;
          padding: 8px;
          /* display: none; */
          border-collapse: collapse;
        }

        tbody tr:nth-child(even) {
          background-color: #e9ecef;
        }

        th,
        td {
          border: solid 1px #868e96;
          padding: 8px;
          min-width: 100px;
          color: #212529;
        }

        th {
          font-weight: 500;
        }

        .card-total {
          text-align: center;
          font-weight: 500;
          letter-spacing: 1px;
          background-color: #087f5b;
          color: #e6fcf5;
          border-radius: 8px;
          padding: 25px 50px;
          font-size: 20px;
          margin-bottom: 18px;
        }

        .card-footer {
          padding-bottom: 4px;
          font-size: 14px;
          margin-top: auto;
          text-align: center;
          color: #087f5b;
        
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 0);
        }
        
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
