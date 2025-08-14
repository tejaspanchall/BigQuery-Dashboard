const bigquery = require('../config/bigquery');

class MetaService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Get Meta (Facebook) ad spend for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily ad spend data for Meta
   */
  async getAdSpend(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      
      // Get rows
      const [rows] = await table.getRows();
      
      // Process and filter the data
      const spendByDate = {};
      
      rows.forEach(row => {
        try {
          // Get date from BigQueryDate object
          if (!row.date_start || !row.spend) return;
          
          // Extract date from BigQueryDate object
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10); // Get YYYY-MM-DD part
          
          // Only include dates in our target range
          if (date >= startDate && date <= endDate) {
            // Parse spend value
            const spend = parseFloat(row.spend);
            if (!isNaN(spend)) {
              // Add spend to the date's total
              if (!spendByDate[date]) {
                spendByDate[date] = 0;
              }
              spendByDate[date] += spend;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      // Convert aggregated data to array format
      const result = Object.entries(spendByDate).map(([date, totalSpend]) => ({
        date,
        spend: parseFloat(totalSpend.toFixed(2)) // Round to 2 decimal places
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
      
    } catch (error) {
      console.error('Error fetching Meta ad spend:', error);
      throw error;
    }
  }
}

module.exports = new MetaService(); 