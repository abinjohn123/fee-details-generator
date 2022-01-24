require('dotenv').config();
const express = require('express');
const { getMonthMap } = require('./notion');
const { queryDatabase } = require('./notion');
const { getInternMap } = require('./notion');
const { htmltopng } = require('./htmltopng');
const fs = require('fs');

const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('./views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let month = [],
  internNames = [];
let dloadFlag = 0;
let feeDetailsGlobal = [];

getMonthMap().then((data) => {
  month = data;
});

setInterval(async () => {
  month = await getMonthMap();
}, 1000 * 60 * 60 * 24);

async function fetchData(month) {
  let feeDetails = [];
  const internData = await getInternMap();

  internData.forEach(async (internName) => {
    const projectData = await queryDatabase(internName.name, month);
    if (projectData) {
      // console.log('Project data received');
      feeDetails.push(projectData);
      console.log(projectData);
    }
  });
  return feeDetails;
}

app.post('/download-fee-details', async (req, res) => {
  feeDetailsGlobal.forEach(async (internDetail) => {
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
      <span>${internDetail.name}</span>
      <hr />
      <span>Details For:</span>
      <span>${internDetail.month}</span>
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

    for (let i = 1; i < internDetail.projectDetails.length; ++i) {
      htmlString += `
          <tr>
            <td>${internDetail.projectDetails[i].project}</td>
            <td>${internDetail.projectDetails[i].fee}</td>
          </tr> `;
    }

    htmlString += `
        </tbody>
      </table>
    </div>
    <div class="card-total">
      <span>Total:</span>
      <span>Rs. ${internDetail.total}</span>
    </div>
    <div class="card-footer">
    <span>hophead</span>
  </div>
  </div>
    </body>
    </html>`;
    const imageBuffer = await htmltopng(htmlString);

    console.log('HTML2PNG');

    fs.writeFileSync(
      `./Fee-Details/${internDetail.name}--Fee Details--${internDetail.month}.png`,
      imageBuffer
    );
  });

  res.redirect('/');
});

app.post('/query-notion', async (req, res) => {
  const { monthSelected } = req.body;
  dloadFlag = 1;
  feeDetailsGlobal = await fetchData(monthSelected);
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.render('index', { month, feeDetailsGlobal, dloadFlag });
});

app.listen(process.env.PORT);
