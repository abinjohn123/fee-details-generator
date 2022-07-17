const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const database_id = process.env.PROJECT_DATABASE_ID;
const internDatabase_id = process.env.INTERN_DATABASE_ID;

// Check for active contractors and create objects
// that has their name and email address.
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

// Query the project database to retrieve project details
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

  // Iterate over the returned project details
  // to retrieve project name and fee for each.
  // Also compute the total fee
  if (response.results.length !== 0) {
    const result = response.results.map((option) => {
      total += Number(option.properties['Fee (INR)'].number);
      return {
        project: option.properties['Client Name'].title[0].text.content,
        fee: option.properties['Fee (INR)'].number,
      };
    });

    //Convert total to INR representation
    total = Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(total);

    return [result, total];
  }
}

module.exports = {
  queryDatabase,
  activeInternQuery,
};
