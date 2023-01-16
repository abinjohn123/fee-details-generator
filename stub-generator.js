'use strict';
require('dotenv').config();

const { activeInternQuery } = require('./app/notion');
const { queryDatabase } = require('./app/notion');
const query = require('readline-sync');
const { htmltoPDF } = require('./app/htmltoPDF');
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
async function generateFeeDetails(month) {
  const contractWorkersArray = await activeInternQuery();

  for (const obj of contractWorkersArray) {
    [obj.results, obj.total] = await queryDatabase(obj.name, month);
    obj.monthYear = getMonth();

    if (!obj.results) continue;

    const imageBuffer = await htmltoPDF(returnStubHTML(obj));

    fs.writeFileSync(`./Stubs/${obj.name}--Stub--${month}.pdf`, imageBuffer);
  }
}

const returnStubHTML = function (contractor) {
  const today = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const dataAllowance = 300;

  const transactionId = query.question(
    `Transaction ID for ${contractor.name}: `
  );
  const bonus = Number(query.question(`Bonus for ${contractor.name}: Rs. `));

  console.log(
    contractor.total,
    dataAllowance,
    Number.isFinite(bonus) ? bonus : 0
  );

  let htmlString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stub A4</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Sanchez:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
    <style>
    ${fs.readFileSync(`app/stub.css`, 'utf8')}
    </style>  
    <link rel="stylesheet" href="styles/stub.css" />
  </head>
  <body>
    <div class="stub-page light-border">
      <div class="left-block"></div>
      <div class="main-block">
        <div class="stub-header">
          <div class="stub-title">
            <div class="--text">
              <h1>PAY STUB</h1>
              <div class="date">DATE: ${today}</div>
            </div>
            <div class="--logo">
              <img src="https://ik.imagekit.io/c2uwtlicd/logo.png" alt="hophead logo" />
            </div>
          </div>
          <div class="stub-details">
            <div class="stub-hophead-details">
              <h2>Hophead Media</h2>
              <p class="--address">
                Building No: 109/3<br />Inchamudikaran House<br />Poothole -
                Aranattukara Road<br />Thrissur, Kerala<br />680004
              </p>
              <a href="mailto:business@hophead.in" class="--email">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                  />
                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                  />
                </svg>
                business@hophead.in
              </a>
            </div>
            <div class="stub-receiver-details">
              <h3>PAYMENT DETAILS</h3>
              <table class="payment-details alt-bg">
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td>${contractor.name}</td>
                  </tr>
                  <tr>
                  <td>Email:</td>
                  <td>${contractor.email}</td>
                </tr>
                  <tr>
                    <td>Payment For:</td>
                    <td>${contractor.monthYear}</td>
                  </tr>
                  <tr>
                    <td>Transaction ID:</td>
                    <td>${transactionId}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <hr />
        <div class="stub-body">
          <table class="project-details alt-bg">
            <thead>
              <tr>
                <th class="project-number">No.</th>
                <th class="item-name">Item</th>
                <th class="project-fee">Fee (Rs)</th>
              </tr>
            </thead>
            <tbody>`;

  for (let i = 0; i < contractor.results.length; ++i)
    htmlString += `
              <tr>
                <td>${i + 1}</td>
                <td>${contractor.results[i].project}</td>
                <td>${contractor.results[i].fee}</td>
              </tr>
              `;

  htmlString += `
            </tbody>
          </table>
          <table class="total-box">
            <tbody>
              <tr class="--addon">
                <td>Data Allowance</td>
                <td>Rs. ${dataAllowance}</td>
              </tr>
              ${
                Number.isFinite(bonus)
                  ? `
                  <tr class="--addon">
                  <td>Bonus</td>
                  <td>Rs. ${bonus}</td>
                </tr>`
                  : ``
              }
              <tr class="total-amount">
                <td>Total</td>
                <td>Rs. ${
                  contractor.total +
                  dataAllowance +
                  (Number.isFinite(bonus) ? bonus : 0)
                }</td>
              </tr>`;

  htmlString += `
            </tbody>
          </table>
        </div>
        <div class="stub-footer">
          <a class="--email" href="www.hophead.in">www.hophead.in</a>
        </div>
      </div>
    </div>
  </body>
</html>

    `;

  return htmlString;
};

generateFeeDetails(getMonth());
