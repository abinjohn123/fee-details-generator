const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const database_id = process.env.PROJECT_DATABASE_ID;
const internDatabase_id = process.env.INTERN_DATABASE_ID;

// Retrieves the database and displays entire content
async function getDatabase(database_id) {
  const response = await notion.databases.retrieve({
    database_id,
  });
  console.log(response);
  // return response;
}

// CHECK FOR ACTIVE CONTRACTORS AND CREATE OBJECTS
async function activeInternQuery() {
  const response = await notion.databases.query({
    database_id: internDatabase_id,
    filter: {
      property: 'isActive',
      checkbox: {
        equals: true,
      },
    },
  });

  return response.results.map((obj) => ({
    name: obj.properties.Name.title[0].text.content,
    email: obj.properties.ID.people[0].person.email,
  }));
}

// QUERY PROJECT DATABASE TO GET FEE DETAILS
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
      total += Number(option.properties['Fee (INR)'].number);
      return {
        project: option.properties['Client Name'].title[0].text.content,
        fee: option.properties['Fee (INR)'].number,
      };
    });

    total = Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(total);

    return [result, total];
  }
}

// Some deep voodo shit that reduces the large query result into a Id :  name object
function notionPropertiesByID(properties) {
  return Object.values(properties).reduce((obj, property) => {
    const { id, ...rest } = property;
    return { ...obj, [id]: rest };
  }, {});
}

module.exports = {
  queryDatabase,
  activeInternQuery,
};
