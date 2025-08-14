require('dotenv').config();
const bigquery = require('./config/bigquery');

async function checkGoogleTable() {
  try {
    console.log('Checking Google account_performance_report table...');
    const datasetId = process.env.BIGQUERY_DATASET_ID;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    console.log(`Using dataset: ${datasetId} in project: ${projectId}`);
    
    // Get reference to the table
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table('account_performance_report');
    
    // Get metadata to list columns
    const [metadata] = await table.getMetadata();
    const fields = metadata.schema.fields.map(f => f.name);
    console.log('\nTable columns:', fields);
    
    // Get first 5 rows
    const [rows] = await table.getRows({ maxResults: 5 });
    
    if (rows.length === 0) {
      console.log('No rows found in the account_performance_report table.');
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
    
    // Check if cost column exists and has data
    const hasCostColumn = 'metrics_cost_micros' in (rows[0] || {});
    const hasCostData = rows.some(row => row.metrics_cost_micros && parseFloat(row.metrics_cost_micros) > 0);
    
    console.log(`\n--- SUMMARY ---`);
    console.log(`Has 'metrics_cost_micros' column: ${hasCostColumn ? 'YES' : 'NO'}`);
    console.log(`Has cost data > 0: ${hasCostData ? 'YES' : 'NO'}`);
    
    if (hasCostColumn) {
      // Show all cost values
      console.log('\nCost values:');
      rows.forEach((row, i) => {
        const costMicros = row.metrics_cost_micros;
        console.log(`Row ${i+1} metrics_cost_micros: ${costMicros} (${typeof costMicros})`);
        
        if (costMicros) {
          const costValue = parseFloat(costMicros) / 1000000;
          console.log(`Row ${i+1} converted cost: ${costValue}`);
        }
      });
    } else {
      // Try to find columns that might contain cost data
      const possibleCostColumns = fields.filter(field => 
        field.includes('cost') || field.includes('spend') || field.includes('amount') || field.includes('metrics')
      );
      
      if (possibleCostColumns.length > 0) {
        console.log(`\nPossible alternative cost columns: ${possibleCostColumns.join(', ')}`);
      }
    }
    
    // Show all date values
    if ('segments_date' in (rows[0] || {})) {
      console.log('\nDate values:');
      rows.forEach((row, i) => {
        console.log(`Row ${i+1} segments_date: ${JSON.stringify(row.segments_date)} (${typeof row.segments_date})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking Google table:', error);
  }
}

checkGoogleTable(); 