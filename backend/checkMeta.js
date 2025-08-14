require('dotenv').config();
const bigquery = require('./config/bigquery');

async function checkMetaTable() {
  try {
    console.log('Checking Meta ads_insights table...');
    const datasetId = process.env.BIGQUERY_DATASET_ID;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    console.log(`Using dataset: ${datasetId} in project: ${projectId}`);
    
    // Get reference to the table
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table('ads_insights');
    
    // Get metadata to list columns
    const [metadata] = await table.getMetadata();
    const fields = metadata.schema.fields.map(f => f.name);
    console.log('\nTable columns:', fields);
    
    // Get first 5 rows
    const [rows] = await table.getRows({ maxResults: 5 });
    
    if (rows.length === 0) {
      console.log('No rows found in the ads_insights table.');
      return;
    }
    
    console.log(`\nFound ${rows.length} rows. Showing complete data row by row:`);
    
    // Format each row for readability
    rows.forEach((row, i) => {
      console.log(`\n==================== ROW ${i+1} ====================`);
      
      // Print all data for this row
      console.log(JSON.stringify(row, null, 2));
      
      console.log('--------------------------------------------------');
    });
    
    // Check if spend column exists and has data
    const hasSpendColumn = 'spend' in (rows[0] || {});
    const hasSpendData = rows.some(row => row.spend && parseFloat(row.spend) > 0);
    
    console.log(`\n--- SUMMARY ---`);
    console.log(`Has 'spend' column: ${hasSpendColumn ? 'YES' : 'NO'}`);
    console.log(`Has spend data > 0: ${hasSpendData ? 'YES' : 'NO'}`);
    
    if (hasSpendColumn) {
      // Show all spend values
      console.log('\nSpend values:');
      rows.forEach((row, i) => {
        console.log(`Row ${i+1} spend: ${row.spend} (${typeof row.spend})`);
      });
    } else {
      // Try to find columns that might contain spend data
      const possibleSpendColumns = fields.filter(field => 
        field.includes('spend') || field.includes('cost') || field.includes('amount')
      );
      
      if (possibleSpendColumns.length > 0) {
        console.log(`\nPossible alternative spend columns: ${possibleSpendColumns.join(', ')}`);
      }
    }
    
    // Show all date_start values
    if ('date_start' in (rows[0] || {})) {
      console.log('\nDate values:');
      rows.forEach((row, i) => {
        console.log(`Row ${i+1} date_start: ${JSON.stringify(row.date_start)} (${typeof row.date_start})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking Meta table:', error);
  }
}

checkMetaTable(); 