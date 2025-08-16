# BigQuery Dashboard Backend

This is the backend service for the BigQuery Dashboard application, built with Node.js and Express. It provides API endpoints for interacting with Google BigQuery and handling data visualization requests.

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:
```env
PORT=5000
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="your-private-key"
BIGQUERY_DATASET_ID=your_dataset_id
JWT_SECRET=your-jwt-secret-key
DASHBOARD_PASSWORD=your-password
```

## Development

1. Make sure all required environment variables are set
2. Run the development server:
```bash
npm run dev
```
3. The server will start on the specified port (default: 5000)
