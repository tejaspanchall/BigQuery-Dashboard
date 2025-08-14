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

  /**
   * Get Google clicks data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily clicks data for Google
   */
  async getClicks(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      const [rows] = await table.getRows();
      
      const clicksByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.segments_date || row.metrics_clicks === undefined) return;
          
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const clicks = parseInt(row.metrics_clicks);
            if (!isNaN(clicks)) {
              if (!clicksByDate[date]) {
                clicksByDate[date] = 0;
              }
              clicksByDate[date] += clicks;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return Object.entries(clicksByDate).map(([date, clicks]) => ({
        date,
        clicks
      })).sort((a, b) => a.date.localeCompare(b.date));
      
    } catch (error) {
      console.error('Error fetching Google clicks:', error);
      throw error;
    }
  }

  /**
   * Get Google impressions data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily impressions data for Google
   */
  async getImpressions(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      const [rows] = await table.getRows();
      
      const impressionsByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.segments_date || row.metrics_impressions === undefined) return;
          
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const impressions = parseInt(row.metrics_impressions);
            if (!isNaN(impressions)) {
              if (!impressionsByDate[date]) {
                impressionsByDate[date] = 0;
              }
              impressionsByDate[date] += impressions;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return Object.entries(impressionsByDate).map(([date, impressions]) => ({
        date,
        impressions
      })).sort((a, b) => a.date.localeCompare(b.date));
      
    } catch (error) {
      console.error('Error fetching Google impressions:', error);
      throw error;
    }
  }

  /**
   * Get Google CTR data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily CTR data for Google
   */
  async getCTR(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      const [rows] = await table.getRows();
      
      const ctrByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.segments_date || row.metrics_ctr === undefined) return;
          
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const ctr = parseFloat(row.metrics_ctr);
            if (!isNaN(ctr)) {
              if (!ctrByDate[date]) {
                ctrByDate[date] = 0;
              }
              ctrByDate[date] += ctr;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      // Convert to array format with summed CTR values
      const result = Object.entries(ctrByDate).map(([date, totalCTR]) => ({
        date,
        ctr: parseFloat(totalCTR.toFixed(2))
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
      
    } catch (error) {
      console.error('Error fetching Google CTR:', error);
      throw error;
    }
  }

  /**
   * Get Google conversions data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily conversions data for Google
   */
  async getConversions(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      const [rows] = await table.getRows();
      
      const conversionsByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.segments_date || row.metrics_conversions === undefined) return;
          
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const conversions = parseInt(row.metrics_conversions || 0);
            if (!isNaN(conversions)) {
              if (!conversionsByDate[date]) {
                conversionsByDate[date] = 0;
              }
              conversionsByDate[date] += conversions;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return Object.entries(conversionsByDate).map(([date, conversions]) => ({
        date,
        conversions
      })).sort((a, b) => a.date.localeCompare(b.date));
      
    } catch (error) {
      console.error('Error fetching Google conversions:', error);
      throw error;
    }
  }
}

module.exports = new GoogleService(); 