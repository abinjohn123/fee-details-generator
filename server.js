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

let feeDetailsGlobal = [];

getMonthMap().then((data) => {
  month = data;
});

setInterval(async () => {
  month = await getMonthMap();
}, 1000 * 60 * 60 * 24);

async function fetchData(month) {
  let feeDetails = [];
  getInternMap().then((internData) => {
    internData.forEach((internName) => {
      queryDatabase(internName.name, month).then((projectData) => {
        if (projectData) {
          feeDetails.push(projectData);
        }
      });
    });
    feeDetailsGlobal = feeDetails;
  });
}

app.post('/query-notion', async (req, res) => {
  const { monthSelected } = req.body;
  fetchData(monthSelected);
  console.log(await fetchData(monthSelected));
  console.log('FDG in POST', feeDetailsGlobal);
  console.log('POST VALUE: ' + monthSelected);

  res.redirect('/');
});

app.get('/', (req, res) => {
  res.render('index', { month, feeDetailsGlobal });
  console.log('FDG in / ', feeDetailsGlobal);
});

app.listen(process.env.PORT);
