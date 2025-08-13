const bigquery = require('../config/bigquery');
const { DateTime } = require('luxon');

class BigQueryService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Test BigQuery connection
   * @returns {Promise<Object>} Connection status and details
   */
  async testConnection() {
    try {
      // Try to list datasets to verify connection
      const [datasets] = await bigquery.getDatasets();
      const currentDataset = datasets.find(d => d.id === this.datasetId);
      
      return {
        connected: true,
        projectId: this.projectId,
        availableDatasets: datasets.map(d => d.id),
        currentDataset: this.datasetId,
        datasetExists: !!currentDataset,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('BigQuery connection test failed:', error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute a custom SQL query
   * @param {string} query - SQL query to execute
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(query) {
    try {
      const [rows] = await bigquery.query(query);
      return rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * List all tables in the dataset
   * @returns {Promise<Array>} List of tables
   */
  async listTables() {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const [tables] = await dataset.getTables();
      return tables.map(table => ({
        tableId: table.id,
        metadata: table.metadata
      }));
    } catch (error) {
      console.error('Error listing tables:', error);
      throw error;
    }
  }

  /**
   * Get a simple list of table names
   * @returns {Promise<Array<string>>} List of table names
   */
  async getTableNames() {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const [tables] = await dataset.getTables();
      return tables.map(table => table.id);
    } catch (error) {
      console.error('Error getting table names:', error);
      throw error;
    }
  }

  /**
   * Get table schema
   * @param {string} tableId - The ID of the table
   * @returns {Promise<Object>} Table schema
   */
  async getTableSchema(tableId) {
    try {
      const dataset = bigquery.dataset(this.datasetId);
      const [table] = await dataset.table(tableId).get();
      return table.metadata.schema;
    } catch (error) {
      console.error('Error getting table schema:', error);
      throw error;
    }
  }

  /**
   * Get daily KPIs for the overview dashboard
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Daily KPIs including revenue, spend, orders, and MER
   */
  async getDailyKPIs(startDate, endDate) {
    const query = `
      WITH shopify_daily AS (
        SELECT
          DATE(DATETIME(created_at, 'Asia/Kolkata')) as date,
          COUNT(DISTINCT order_id) as order_count,
          SUM(total_price - total_tax) as net_revenue,
          COUNT(DISTINCT CASE WHEN financial_status = 'refunded' THEN order_id END) as refund_count
        FROM \`${this.projectId}.${this.datasetId}.shopify_orders\`
        WHERE DATE(DATETIME(created_at, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
        GROUP BY date
      ),
      ad_spend_daily AS (
        SELECT
          date,
          platform,
          SUM(spend) as spend
        FROM (
          SELECT DATE(DATETIME(date, 'Asia/Kolkata')) as date, 'Meta' as platform, spend
          FROM \`${this.projectId}.${this.datasetId}.meta_daily\`
          WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
          UNION ALL
          SELECT DATE(DATETIME(date, 'Asia/Kolkata')) as date, 'Google Ads' as platform, spend
          FROM \`${this.projectId}.${this.datasetId}.google_ads_daily\`
          WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
        )
        GROUP BY date, platform
      )
      SELECT
        COALESCE(s.date, a.date) as date,
        COALESCE(s.order_count, 0) as orders,
        COALESCE(s.refund_count, 0) as refunds,
        COALESCE(s.net_revenue, 0) as net_revenue,
        COALESCE(SUM(a.spend), 0) as total_spend,
        SAFE_DIVIDE(COALESCE(s.net_revenue, 0), NULLIF(COALESCE(SUM(a.spend), 0), 0)) as mer
      FROM shopify_daily s
      FULL OUTER JOIN ad_spend_daily a ON s.date = a.date
      GROUP BY date, orders, refunds, net_revenue
      ORDER BY date ASC
    `;

    const options = {
      query,
      params: {
        startDate,
        endDate,
      },
    };

    return await this.executeQuery(options);
  }

  /**
   * Get platform comparison data
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Platform comparison metrics
   */
  async getPlatformComparison(startDate, endDate) {
    const query = `
      WITH platform_metrics AS (
        SELECT
          'Meta' as platform,
          DATE(DATETIME(date, 'Asia/Kolkata')) as date,
          spend,
          clicks,
          impressions
        FROM \`${this.projectId}.${this.datasetId}.meta_daily\`
        WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
        UNION ALL
        SELECT
          'Google Ads' as platform,
          DATE(DATETIME(date, 'Asia/Kolkata')) as date,
          spend,
          clicks,
          impressions
        FROM \`${this.projectId}.${this.datasetId}.google_ads_daily\`
        WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
      )
      SELECT
        platform,
        SUM(spend) as total_spend,
        SUM(clicks) as total_clicks,
        SUM(impressions) as total_impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        SAFE_DIVIDE(SUM(spend), SUM(clicks)) as cpc
      FROM platform_metrics
      GROUP BY platform
    `;

    const options = {
      query,
      params: {
        startDate,
        endDate,
      },
    };

    return await this.executeQuery(options);
  }

  /**
   * Get campaign drilldown data
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {string} platform - Platform filter (optional)
   * @returns {Promise<Object>} Campaign performance data
   */
  async getCampaignDrilldown(startDate, endDate, platform = null) {
    let platformFilter = '';
    if (platform) {
      platformFilter = `AND platform = @platform`;
    }

    const query = `
      WITH campaign_metrics AS (
        SELECT
          'Meta' as platform,
          campaign_name,
          DATE(DATETIME(date, 'Asia/Kolkata')) as date,
          spend,
          clicks,
          impressions
        FROM \`${this.projectId}.${this.datasetId}.meta_daily\`
        WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
        UNION ALL
        SELECT
          'Google Ads' as platform,
          campaign_name,
          DATE(DATETIME(date, 'Asia/Kolkata')) as date,
          spend,
          clicks,
          impressions
        FROM \`${this.projectId}.${this.datasetId}.google_ads_daily\`
        WHERE DATE(DATETIME(date, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
      )
      SELECT
        platform,
        campaign_name,
        SUM(spend) as total_spend,
        SUM(clicks) as total_clicks,
        SUM(impressions) as total_impressions,
        SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr,
        SAFE_DIVIDE(SUM(spend), SUM(clicks)) as cpc
      FROM campaign_metrics
      WHERE 1=1 ${platformFilter}
      GROUP BY platform, campaign_name
      ORDER BY total_spend DESC
    `;

    const options = {
      query,
      params: {
        startDate,
        endDate,
        ...(platform && { platform }),
      },
    };

    return await this.executeQuery(options);
  }

  /**
   * Get orders and refunds data
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Orders and refunds data
   */
  async getOrdersAndRefunds(startDate, endDate) {
    const query = `
      SELECT
        DATE(DATETIME(created_at, 'Asia/Kolkata')) as date,
        order_id,
        total_price,
        total_tax,
        total_price - total_tax as net_revenue,
        financial_status,
        fulfillment_status,
        CASE 
          WHEN financial_status = 'refunded' THEN total_price - total_tax
          ELSE 0
        END as refund_amount
      FROM \`${this.projectId}.${this.datasetId}.shopify_orders\`
      WHERE DATE(DATETIME(created_at, 'Asia/Kolkata')) BETWEEN @startDate AND @endDate
      ORDER BY created_at DESC
    `;

    const options = {
      query,
      params: {
        startDate,
        endDate,
      },
    };

    return await this.executeQuery(options);
  }
}

module.exports = new BigQueryService(); 