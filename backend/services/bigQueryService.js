const bigquery = require('../config/bigquery');

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


}

module.exports = new BigQueryService(); 