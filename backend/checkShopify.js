require('dotenv').config();
const bigquery = require('./config/bigquery');

async function checkShopifyTable() {
  try {
    console.log('Checking Shopify orders table structure...');
    const datasetId = process.env.BIGQUERY_DATASET_ID;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    console.log(`Using dataset: ${datasetId} in project: ${projectId}`);
    
    // Get reference to the table
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table('shopifyakikoorders');
    
    // Get metadata to list columns
    const [metadata] = await table.getMetadata();
    console.log('\nTable schema:');
    console.log(JSON.stringify(metadata.schema.fields, null, 2));
    
    // Get sample rows
    const [rows] = await table.getRows({ maxResults: 5 });
    
    if (rows.length === 0) {
      console.log('No rows found in the shopifyakikoorders table.');
      return;
    }
    
    console.log(`\nFound ${rows.length} sample rows. Showing data:`);
    
    rows.forEach((row, i) => {
      console.log(`\n=== Row ${i + 1} ===`);
      console.log('processed_at:', row.processed_at);
      console.log('confirmed:', row.confirmed);
      console.log('Full row data:', JSON.stringify(row, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkShopifyTable(); 