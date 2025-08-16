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
   * @returns {Promise<Object>} Total ad spend data for Meta
   */
  async getAdSpend(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      
      // Get rows
      const [rows] = await table.getRows();
      
      // Process and filter the data
      let totalSpend = 0;
      let dailySpends = [];
      
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
              totalSpend += spend;
              dailySpends.push({
                date,
                spend: parseFloat(spend.toFixed(2))
              });
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return {
        total_spend: parseFloat(totalSpend.toFixed(2)),
        daily_spends: dailySpends.sort((a, b) => a.date.localeCompare(b.date))
      };
      
    } catch (error) {
      console.error('Error fetching Meta ad spend:', error);
      throw error;
    }
  }

  /**
   * Get Meta (Facebook) clicks data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily clicks data for Meta
   */
  async getClicks(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      const [rows] = await table.getRows();
      
      const clicksByDate = {};
      let totalClicks = 0;
      
      rows.forEach(row => {
        try {
          if (!row.date_start || row.clicks === undefined) return;
          
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const clicks = parseInt(row.clicks);
            if (!isNaN(clicks)) {
              if (!clicksByDate[date]) {
                clicksByDate[date] = 0;
              }
              clicksByDate[date] += clicks;
              totalClicks += clicks;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return {
        count: totalClicks,
        daily_data: Object.entries(clicksByDate).map(([date, clicks]) => ({
          date,
          clicks
        })).sort((a, b) => a.date.localeCompare(b.date))
      };
      
    } catch (error) {
      console.error('Error fetching Meta clicks:', error);
      throw error;
    }
  }

  /**
   * Get Meta (Facebook) impressions data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily impressions data for Meta
   */
  async getImpressions(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      const [rows] = await table.getRows();
      
      const impressionsByDate = {};
      let totalImpressions = 0;
      
      rows.forEach(row => {
        try {
          if (!row.date_start || row.impressions === undefined) return;
          
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const impressions = parseInt(row.impressions);
            if (!isNaN(impressions)) {
              if (!impressionsByDate[date]) {
                impressionsByDate[date] = 0;
              }
              impressionsByDate[date] += impressions;
              totalImpressions += impressions;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return {
        count: totalImpressions,
        daily_data: Object.entries(impressionsByDate).map(([date, impressions]) => ({
          date,
          impressions
        })).sort((a, b) => a.date.localeCompare(b.date))
      };
      
    } catch (error) {
      console.error('Error fetching Meta impressions:', error);
      throw error;
    }
  }

  /**
   * Get Meta (Facebook) CTR data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} CTR data with total and daily values
   */
  async getCTR(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      const [rows] = await table.getRows();
      
      const aggregatedData = {
        impressions: 0,
        clicks: 0
      };
      
      rows.forEach(row => {
        try {
          if (!row.date_start) return;
          
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            // Parse values, defaulting to 0 if undefined or NaN
            let clicks = parseInt(row.clicks || 0);
            let impressions = parseInt(row.impressions || 0);
            
            // Handle NaN values
            clicks = isNaN(clicks) ? 0 : clicks;
            impressions = isNaN(impressions) ? 0 : impressions;
            
            // Accumulate values
            aggregatedData.impressions += impressions;
            aggregatedData.clicks += clicks;
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      // Calculate CTR using total clicks and impressions
      const ctr = aggregatedData.impressions > 0 
        ? (aggregatedData.clicks / aggregatedData.impressions) * 100 
        : 0;
      
      return {
        ratio: parseFloat(ctr.toFixed(2))
      };
      
    } catch (error) {
      console.error('Error fetching Meta CTR:', error);
      throw error;
    }
  }

  /**
   * Get Meta (Facebook) conversions data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Daily conversions data for Meta
   */
  async getConversions(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      const [rows] = await table.getRows();
      
      const conversionsByDate = {};
      let totalConversions = 0;
      
      rows.forEach(row => {
        try {
          if (!row.date_start || row.conversions === undefined) return;
          
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10);
          
          if (date >= startDate && date <= endDate) {
            const conversions = parseInt(row.conversions || 0);
            if (!isNaN(conversions)) {
              if (!conversionsByDate[date]) {
                conversionsByDate[date] = 0;
              }
              conversionsByDate[date] += conversions;
              totalConversions += conversions;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      });
      
      return {
        count: totalConversions,
        daily_data: Object.entries(conversionsByDate).map(([date, conversions]) => ({
          date,
          conversions
        })).sort((a, b) => a.date.localeCompare(b.date))
      };
      
    } catch (error) {
      console.error('Error fetching Meta conversions:', error);
      throw error;
    }
  }
}

module.exports = new MetaService(); 