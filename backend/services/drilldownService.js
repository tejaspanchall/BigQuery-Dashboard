const bigquery = require('../config/bigquery');

class DrilldownService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Get drilldown data from Google and Meta for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Combined drilldown data for Google and Meta
   */
  async getDrilldownData(startDate, endDate) {
    try {
      // Get Google data
      const googleData = await this.getGoogleDrilldownData(startDate, endDate);
      
      // Get Meta data
      const metaData = await this.getMetaDrilldownData(startDate, endDate);
      
      return {
        google: googleData,
        meta: metaData
      };
    } catch (error) {
      console.error('Error fetching drilldown data:', error);
      throw error;
    }
  }

  /**
   * Get Google drilldown data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Aggregated Google drilldown data for the entire date range
   */
  async getGoogleDrilldownData(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('account_performance_report');
      const [rows] = await table.getRows();

      const customerIdSet = new Set();
      const descriptiveNameSet = new Set();
      
      const aggregatedData = {
        dates: new Set(),
        cost: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cpc_total: 0,
        cpm_total: 0
      };

      const cpcByDate = {};
      const cpmByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.segments_date) return;
          
          const dateStr = row.segments_date.value || row.segments_date;
          const date = dateStr.substring(0, 10); // Get YYYY-MM-DD part
          
          if (date >= startDate && date <= endDate) {
            // Convert cost from micros to standard currency
            const cost = row.metrics_cost_micros ? parseFloat(row.metrics_cost_micros) / 1000000 : 0;
            const impressions = parseInt(row.metrics_impressions || 0);
            const clicks = parseInt(row.metrics_clicks || 0);
            // Convert CPC from micros to standard currency
            const average_cpc = row.metrics_average_cpc ? parseFloat(row.metrics_average_cpc) / 1000000 : 0;
            // Convert CPM from micros to standard currency
            const average_cpm = row.metrics_average_cpm ? parseFloat(row.metrics_average_cpm) / 1000000 : 0;
            const conversions = parseInt(row.metrics_conversions || 0);
            
            // Store unique customer IDs and names
            if (row.customer_id) customerIdSet.add(row.customer_id);
            if (row.customer_descriptive_name) descriptiveNameSet.add(row.customer_descriptive_name);
            
            // Track unique dates
            aggregatedData.dates.add(date);
            
            // Accumulate values
            aggregatedData.cost += cost;
            aggregatedData.impressions += impressions;
            aggregatedData.clicks += clicks;
            aggregatedData.conversions += conversions;
            
            // For CPC calculation - track by date
            if (!cpcByDate[date]) {
              cpcByDate[date] = 0;
            }
            cpcByDate[date] += average_cpc;
            aggregatedData.cpc_total += average_cpc;
            
            // For CPM calculation - track by date
            if (!cpmByDate[date]) {
              cpmByDate[date] = 0;
            }
            cpmByDate[date] += average_cpm;
            aggregatedData.cpm_total += average_cpm;
          }
        } catch (e) {
          console.error('Error processing Google row:', e);
        }
      });
      
      // Convert customer IDs and names to comma-separated strings
      aggregatedData.customer_id = Array.from(customerIdSet).join(', ');
      aggregatedData.customer_descriptive_name = Array.from(descriptiveNameSet).join(', ');
      
      // Calculate CTR using total clicks and impressions
      const ctr = aggregatedData.impressions > 0 
        ? (aggregatedData.clicks / aggregatedData.impressions) * 100 
        : 0;
      
      // Calculate average CPC and CPM
      const cpc = aggregatedData.dates.size > 0
        ? aggregatedData.cpc_total / aggregatedData.dates.size
        : 0;
        
      const cpm = aggregatedData.dates.size > 0
        ? aggregatedData.cpm_total / aggregatedData.dates.size
        : 0;
      
      // Create final result object
      return {
        customer_id: aggregatedData.customer_id,
        customer_descriptive_name: aggregatedData.customer_descriptive_name,
        cost: parseFloat(aggregatedData.cost.toFixed(2)),
        impressions: aggregatedData.impressions,
        clicks: aggregatedData.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        cpm: parseFloat(cpm.toFixed(2)),
        conversions: aggregatedData.conversions
      };
      
    } catch (error) {
      console.error('Error fetching Google drilldown data:', error);
      throw error;
    }
  }

  /**
   * Get Meta drilldown data for specific dates
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Aggregated Meta drilldown data for the entire date range
   */
  async getMetaDrilldownData(startDate, endDate) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('ads_insights');
      const [rows] = await table.getRows();

      const accountIdSet = new Set();
      const accountNameSet = new Set();
      
      const aggregatedData = {
        dates: new Set(),
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cpc_total: 0,
        cpm_total: 0
      };

      const cpcByDate = {};
      const cpmByDate = {};
      
      rows.forEach(row => {
        try {
          if (!row.date_start) return;
          
          const dateStr = row.date_start.value || row.date_start;
          const date = dateStr.substring(0, 10); // Get YYYY-MM-DD part
          
          if (date >= startDate && date <= endDate) {
            const spend = parseFloat(row.spend || 0);
            const impressions = parseInt(row.impressions || 0);
            const clicks = parseInt(row.clicks || 0);
            const cpc = parseFloat(row.cpc || 0);
            const cpm = parseFloat(row.cpm || 0);
            const conversions = parseInt(row.conversions || 0);
            
            // Store unique account IDs and names
            if (row.account_id) accountIdSet.add(row.account_id);
            if (row.account_name) accountNameSet.add(row.account_name);
            
            // Track unique dates
            aggregatedData.dates.add(date);
            
            // Accumulate values
            aggregatedData.spend += spend;
            aggregatedData.impressions += impressions;
            aggregatedData.clicks += clicks;
            aggregatedData.conversions += conversions;
            
            // For CPC calculation - track by date
            if (!cpcByDate[date]) {
              cpcByDate[date] = 0;
            }
            cpcByDate[date] += cpc;
            aggregatedData.cpc_total += cpc;
            
            // For CPM calculation - track by date
            if (!cpmByDate[date]) {
              cpmByDate[date] = 0;
            }
            cpmByDate[date] += cpm;
            aggregatedData.cpm_total += cpm;
          }
        } catch (e) {
          console.error('Error processing Meta row:', e);
        }
      });
      
      // Convert account IDs and names to comma-separated strings
      aggregatedData.account_id = Array.from(accountIdSet).join(', ');
      aggregatedData.account_name = Array.from(accountNameSet).join(', ');
      
      // Calculate CTR using total clicks and impressions
      const ctr = aggregatedData.impressions > 0 
        ? (aggregatedData.clicks / aggregatedData.impressions) * 100 
        : 0;
      
      // Calculate average CPC and CPM
      const cpc = aggregatedData.dates.size > 0
        ? aggregatedData.cpc_total / aggregatedData.dates.size
        : 0;
        
      const cpm = aggregatedData.dates.size > 0
        ? aggregatedData.cpm_total / aggregatedData.dates.size
        : 0;
      
      // Create final result object
      return {
        account_id: aggregatedData.account_id,
        account_name: aggregatedData.account_name,
        spend: parseFloat(aggregatedData.spend.toFixed(2)),
        impressions: aggregatedData.impressions,
        clicks: aggregatedData.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        cpm: parseFloat(cpm.toFixed(2)),
        conversions: aggregatedData.conversions
      };
      
    } catch (error) {
      console.error('Error fetching Meta drilldown data:', error);
      throw error;
    }
  }
}

module.exports = new DrilldownService(); 