require('dotenv').config();
const express = require('express');
const { getMonthMap } = require('./notion');
const { queryDatabase } = require('./notion');
const { getInternMap } = require('./notion');

const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('./views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let month = [],
  internNames = [];
let dloadFlag = 1;
let feeDetailsGlobal = [];

getMonthMap().then((data) => {
  month = data;
});

setInterval(async () => {
  month = await getMonthMap();
}, 1000 * 60 * 60 * 24);

async function fetchData(month) {
  let feeDetails = [];
  // getInternMap().then((internData) => {
  //   internData.forEach((internName) => {
  //     queryDatabase(internName.name, month).then((projectData) => {
  //       if (projectData) {
  //         feeDetails.push(projectData);
  //       }
  //     });
  //   });
  //   return feeDetails;
  // });

  const internData = await getInternMap();

  internData.forEach(async (internName) => {
    const projectData = await queryDatabase(internName.name, month);
    if (projectData) {
      console.log('Project data received');
      feeDetails.push(projectData);
    }
  });
  return feeDetails;
}

app.post('/query-notion', async (req, res) => {
  const { monthSelected } = req.body;
  // fetchData(monthSelected).then(() => {
  //   if (feeDetailsGlobal) {
  //     res.redirect('/');
  //     let timer = setTimeout(location.reload(), 4000);
  //   }
  // });
  feeDetailsGlobal = await fetchData(monthSelected);

  if (feeDetailsGlobal) {
    res.redirect('/');
  }

  console.log('FDG in POST', feeDetailsGlobal);
  console.log('POST VALUE: ' + monthSelected);
});

app.get('/', (req, res) => {
  res.render('index', { month, feeDetailsGlobal, dloadFlag });
  console.log('FDG in / ', feeDetailsGlobal);
});

app.listen(process.env.PORT);
