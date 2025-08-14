const bigquery = require('../config/bigquery');

class GoogleService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Get Google ad spend for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily ad spend data for Google
   */
  async getAdSpend(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      
      // Get rows
      const [rows] = await table.getRows();
      
      // Process and filter the data
      const spendByDate = {};
      
      rows.forEach(row => {
        try {
          // Get date from BigQueryDate object
          if (!row.segments_date || !row.metrics_cost_micros) return;
          
          // Extract date from BigQueryDate object
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10); // Get YYYY-MM-DD part
          
          // Only include dates in our target range
          if (date >= startDate && date <= endDate) {
            // Parse cost value and convert from micros
            const costMicros = parseFloat(row.metrics_cost_micros);
            if (!isNaN(costMicros)) {
              // Convert micros to standard currency and add to date's total
              const spend = costMicros / 1000000;
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
      console.error('Error fetching Google ad spend:', error);
      throw error;
    }
  }
}

module.exports = new GoogleService(); 