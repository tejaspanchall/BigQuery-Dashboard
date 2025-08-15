const metaService = require('./metaService');
const googleService = require('./googleService');
const shopifyService = require('./shopifyService');
const moment = require('moment-timezone');

class TrendService {
  constructor() {
    this.timezone = 'Asia/Kolkata';
  }

  /**
   * Convert UTC date to IST date string
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {string} Date string in YYYY-MM-DD format in IST
   */
  convertToIST(dateStr) {
    return moment(dateStr).tz(this.timezone).format('YYYY-MM-DD');
  }

  /**
   * Get daily trend data combining spend, revenue and orders
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Daily trend data and summary
   */
  async getDailyTrend(startDate, endDate) {
    try {
      // Fetch all data in parallel
      const [metaSpend, googleSpend, shopifyData] = await Promise.all([
        metaService.getAdSpend(startDate, endDate),
        googleService.getAdSpend(startDate, endDate),
        shopifyService.getDailyMetrics(startDate, endDate)
      ]);

      // Initialize data structure for daily aggregation
      const dailyData = {};

      // Process Meta spend
      metaSpend.daily_spends.forEach(({ date, spend }) => {
        if (!dailyData[date]) {
          dailyData[date] = { total_spend: 0, net_revenue: 0, order_count: 0 };
        }
        dailyData[date].total_spend += spend;
      });

      // Process Google spend
      googleSpend.daily_spends.forEach(({ date, spend }) => {
        if (!dailyData[date]) {
          dailyData[date] = { total_spend: 0, net_revenue: 0, order_count: 0 };
        }
        dailyData[date].total_spend += spend;
      });

      // Process Shopify data
      shopifyData.forEach(({ date, revenue, orders }) => {
        if (!dailyData[date]) {
          dailyData[date] = { total_spend: 0, net_revenue: 0, order_count: 0 };
        }
        dailyData[date].net_revenue = revenue;
        dailyData[date].order_count = orders;
      });

      // Convert to array and sort by date
      const data = Object.entries(dailyData)
        .map(([date, metrics]) => ({
          date: this.convertToIST(date),
          ...metrics,
          // Round all numbers to 2 decimal places
          total_spend: parseFloat(metrics.total_spend.toFixed(2)),
          net_revenue: parseFloat(metrics.net_revenue.toFixed(2))
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate summary
      const summary = data.reduce((acc, day) => {
        acc.total_spend += day.total_spend;
        acc.total_revenue += day.net_revenue;
        acc.total_orders += day.order_count;
        return acc;
      }, {
        total_spend: 0,
        total_revenue: 0,
        total_orders: 0
      });

      // Calculate average daily MER
      summary.average_daily_mer = summary.total_spend > 0 
        ? parseFloat((summary.total_revenue / summary.total_spend).toFixed(2))
        : 0;

      // Round summary numbers
      summary.total_spend = parseFloat(summary.total_spend.toFixed(2));
      summary.total_revenue = parseFloat(summary.total_revenue.toFixed(2));

      return { data, summary };

    } catch (error) {
      console.error('Error fetching daily trend data:', error);
      throw error;
    }
  }
}

module.exports = new TrendService(); 