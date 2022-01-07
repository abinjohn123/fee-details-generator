const { Client } = require('@notionhq/client');
const { response } = require('express');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const database_id = process.env.NOTION_DATABASE_ID;

let InternMap = [];

// Retrieves the database and displays entire content
async function getDatabase() {
  const response = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  console.log(response);
  // return response;
}

// Queries the database with an AND filter for intern name and month
async function queryDatabase(internName, month) {
  let total = 0;
  const response = await notion.databases.query({
    database_id: database_id,
    filter: {
      and: [
        {
          property: process.env.NOTION_MONTH_ID,
          select: {
            equals: month,
          },
        },
        {
          property: process.env.NOTION_ASSIGNED_TO_ID,
          select: {
            equals: internName,
          },
        },
      ],
    },
  });

  if (response.results.length !== 0) {
    const result = response.results.map((option) => {
      return {
        project: option.properties['Client Name'].title[0].text.content,
        fee: option.properties['Fee (INR)'].number,
      };
    });

    for (let i = 0; i < result.length; ++i) total += Number(result[i].fee);

    result.unshift({ name: internName, month: month, total: total });

    return result;
  }
}

// Some deep voodo shit that reduces the large query result into a Id :  name object
function notionPropertiesByID(properties) {
  return Object.values(properties).reduce((obj, property) => {
    const { id, ...rest } = property;
    return { ...obj, [id]: rest };
  }, {});
}

// Makes use of the voodo shit to retrieve all the intern ID; intern name pairs
async function getInternMap() {
  const response = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  return notionPropertiesByID(response.properties)[
    process.env.NOTION_ASSIGNED_TO_ID
  ].select.options.map((option) => {
    // return option.name;
    return { id: option.id, name: option.name };
    // console.log({ id: option.id, name: option.name });
  });
}

async function getMonthMap() {
  const response = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  return notionPropertiesByID(response.properties)[
    process.env.NOTION_MONTH_ID
  ].select.options.map((option) => {
    return { id: option.id, name: option.name };
  });
}

module.exports = {
  getInternMap,
  getMonthMap,
  queryDatabase,
};
