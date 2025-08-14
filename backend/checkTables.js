require('dotenv').config();
const bigquery = require('./config/bigquery').bigquery;

async function checkTables() {
  try {
    const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);
    const [tables] = await dataset.getTables();
    
    console.log('\nAvailable tables:', tables.map(table => table.id));

    // Get schema for each table
    for (const table of tables) {
      const [metadata] = await table.getMetadata();
      console.log(`\nSchema for table ${table.id}:`);
      console.log(JSON.stringify(metadata.schema.fields, null, 2));

      // Get sample data (first row)
      const [rows] = await table.getRows({ maxResults: 1 });
      if (rows.length > 0) {
        console.log(`\nSample data for ${table.id}:`);
        console.log(JSON.stringify(rows[0], null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables(); 