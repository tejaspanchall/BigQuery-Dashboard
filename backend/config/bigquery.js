const { BigQuery } = require('@google-cloud/bigquery');

// Initialize BigQuery client with credentials from env variables
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),  // Handle escaped newlines
  }
});

module.exports = bigquery; 