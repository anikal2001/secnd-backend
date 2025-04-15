import { Seller } from '../entity/seller.entity';
import { SellerRepository } from '../repositories/seller.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AppDataSource } from '../database/config';
import { plainToInstance } from 'class-transformer';
import { Product } from '../entity/product.entity';
import { UserService } from './user.service';
import { User } from '../entity/user.entity';
import { ProductFilter, PaginationOptions, PaginatedProducts, ExtendedProduct } from '../interfaces/product.filter';
import { ProductStatus } from '../utils/products.enums';
import { Order } from '../entity/order.entity';
import { OrderService } from './order.service';

export class SellerService {
  private userService: UserService = new UserService();
  private orderService: OrderService = new OrderService();

  async createSeller(createSellerDto: Seller): Promise<Seller> {
    const user = await this.userService.getUserById(createSellerDto.user_id as unknown as string);
    if (!user) {
      throw new Error('User does not exist');
    }
    const sellerData: Partial<Seller> = {
      user_id: createSellerDto.user_id,
      email: createSellerDto.email,
      store_name: createSellerDto.store_name,
      store_description: createSellerDto.store_description,
      store_logo: createSellerDto.store_logo,
    };
    const savedSeller = await SellerRepository.createAndSave(sellerData);
    await this.userService.makeUserSeller(createSellerDto.user_id as unknown as string);
    return plainToInstance(Seller, savedSeller);
  }

  async fetchSellers(): Promise<Seller[]> {
    const sellers = await SellerRepository.find();
    if (!sellers) {
      return [];
    }
    const sellerDTO = sellers.map((seller: Seller) => {
      const instanceConversion = plainToInstance(Seller, seller);
      return instanceConversion;
    });
    return sellerDTO;
  }

  async getSellerById(sellerId: string): Promise<Seller | null> {
    const seller = await SellerRepository.getByID(sellerId);
    if (!seller) {
      return null;
    }
    return plainToInstance(Seller, seller);
  }

  async getSellerProducts(filter: ProductFilter, pagination?: PaginationOptions): Promise<PaginatedProducts> {
    try {
      return await SellerRepository.getSellerProducts(filter, pagination);
    } catch (error) {
      console.error('Error getting seller products:', error);
      throw error;
    }
  }

  async updateSeller(sellerId: string, updatedSeller: Seller): Promise<Seller | null> {
    const seller = await SellerRepository.getByID(sellerId);
    AppDataSource.createQueryBuilder().update(Seller).set(updatedSeller).where('seller_id = :seller_id', { seller_id: sellerId }).execute();
    return null;
  }

  async deleteSeller(sellerId: string): Promise<boolean> {
    const seller = await SellerRepository.getByID(sellerId);
    if (seller) {
      await AppDataSource.createQueryBuilder().delete().from(Seller).where('seller_id = :seller_id', { sellerId }).execute();
    }
    return false;
  }

  async getTrendingProducts(sellerID: string): Promise<Product[]> {
    const trendingProducts = await ProductRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.interactions', 'interaction')
      .where('interaction.interaction_date >= :startDate', { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }) // last 7 days
      .andWhere('product.sellerId = :sellerId', { sellerID }) // Filter by specific seller
      .select('product.product_id', 'product_id')
      .addSelect('product.title', 'title')
      .addSelect('COUNT(interaction.interaction_id)', 'interaction_count')
      .groupBy('product.product_id')
      .orderBy('interaction_count', 'DESC')
      .limit(10) // Limit to top 10 trending products
      .getRawMany();
    const productDTO = trendingProducts.map((product) => {
      const instanceConversion = plainToInstance(Product, product);
      return instanceConversion;
    });
    return productDTO;
  }

  async getSellerRevenues(sellerID: string): Promise<number> {
    const filter: ProductFilter = {
      sellerId: sellerID,
    };
    const sellerProducts = await SellerRepository.getSellerProducts(filter);

    if (!sellerProducts || !sellerProducts.products || sellerProducts.products.length === 0) {
      return 0;
    }

    const totalRevenue = sellerProducts.products.reduce((acc: number, product: ExtendedProduct) => {
      if (product.status === ProductStatus.sold) {
        return acc + (product.price || 0);
      }
      return acc;
    }, 0);

    return totalRevenue;
  }

  async getSellerOrders(sellerID: string): Promise<number> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.sold,
      };

      const sellerProducts = await SellerRepository.getSellerProducts(filter);

      // Return total number of sold products
      return sellerProducts.total || 0;
    } catch (error) {
      console.error('Error getting seller orders:', error);
      return 0;
    }
  }

  async getSellerCustomers(sellerID: string): Promise<User[]> {
    try {
      const customers = await AppDataSource.getRepository(User)
        .createQueryBuilder('user')
        .innerJoin('user.orders', 'order')
        .innerJoin('order.orderItems', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.seller = :sellerId', { sellerID })
        .distinct(true)
        .getMany();

      return customers;
    } catch (error) {
      console.error('Error fetching seller customers:', error);
      throw new Error('Failed to fetch seller customers');
    }
  }

  async getTopSellers(): Promise<null> {
    return null;
  }

  async getTrendingSellers(): Promise<null> {
    return null;
  }

  async getSellerCategoryCounts(sellerID: string): Promise<{ [key: string]: number }> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.active,
      };

      const products = await SellerRepository.getSellerProducts(filter);

      // Initialize counts object
      const categoryCounts: { [key: string]: number } = {};

      // Count products by category
      products.products.forEach((product: ExtendedProduct) => {
        const category = product.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      return categoryCounts;
    } catch (error) {
      console.error('Error getting seller category counts:', error);
      throw error;
    }
  }

  async getAnalyticsActiveListings(sellerID: string): Promise<number> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.active,
      };

      const products = await SellerRepository.getSellerProducts(filter);

      // Return total number of active products
      return products.total || 0;
    } catch (error) {
      console.error('Error getting analytics active listings:', error);
      return 0;
    }
  }

  async getAnalyticsInventoryPrice(sellerID: string): Promise<number> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.active,
      };

      const products = await SellerRepository.getSellerProducts(filter);

      // Return total inventory price of active products
      return products.products.reduce((acc: number, product: ExtendedProduct) => {
        return acc + (product.price || 0);
      }, 0);
    } catch (error) {
      console.error('Error getting analytics inventory price:', error);
      return 0;
    }
  }

  async getAnalyticsAverageSalePrice(sellerID: string): Promise<number> {
    try {
      const filter: ProductFilter = {
        sellerId: sellerID,
        status: ProductStatus.sold,
      };

      const soldProducts = await SellerRepository.getSellerProducts(filter);

      // If no sold products, return 0
      if (!soldProducts || soldProducts.products.length === 0) {
        return 0;
      }

      // Calculate total sales value
      const totalSalesValue = soldProducts.products.reduce((acc: number, product: ExtendedProduct) => {
        return acc + (product.price || 0);
      }, 0);

      // Return average sale price
      return totalSalesValue / soldProducts.products.length;
    } catch (error) {
      console.error('Error getting analytics average sale price:', error);
      return 0;
    }
  }

  async getAnalyticsAverageTurnoverTime(sellerID: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<number> {
    try {
      return await this.orderService.getAnalyticsAverageTurnoverTime(sellerID, period);
    } catch (error) {
      console.error('Error getting analytics average turnover time:', error);
      return 0;
    }
  }

  /**
   * Get comprehensive dashboard data with statistics and graphs for a seller
   * @param sellerID The seller's ID
   * @param timeFrame The time frame for data (today, yesterday, last7days, last30days, thisMonth, thisYear, lastYear, allTime)
   * @param graphMetric The primary metric to graph (orders, revenue, listings)
   * @returns Dashboard data with statistics and graph points
   */
  async getSellerDashboard(sellerID: string, timeFrame: string = 'last30days', graphMetric: string = 'revenue'): Promise<any> {
    try {
      // 1. Define date ranges based on time frame
      const dateRange = this.getDateRangeFromTimeFrame(timeFrame);
      const { startDate, endDate, intervalType } = dateRange;

      // 2. Get statistics with change metrics based on time frame
      const stats = await this.getStatisticsWithChanges(sellerID, startDate, endDate, timeFrame);

      // 3. Get graph data points for all metrics (revenue, orders, listings)
      const graphData = await this.getGraphData(sellerID, graphMetric, startDate, endDate, intervalType);

      // 4. Get marketplace split
      const marketplaceSplit = await this.getMarketplaceSplit(sellerID, startDate, endDate);

      // 5. Get category counts for insights
      const categoryCounts = await this.getSellerCategoryCounts(sellerID);

      // 6. Format category data for insights
      const categoryInsights = this.formatCategoryInsights(categoryCounts);

      // 7. Combine and return all data
      return {
        timeFrame,
        graphMetric,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        statistics: stats,
        graphData,
        marketplaceSplit,
        categoryInsights,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting seller dashboard:', error);
      throw error;
    }
  }

  /**
   * Get statistics with change metrics based on the timeframe
   */
  private async getStatisticsWithChanges(sellerID: string, startDate: Date, endDate: Date, timeFrame: string): Promise<any> {
    // Get current period stats
    const currentStats = await this.getStatisticsForDateRange(sellerID, startDate, endDate);

    // Get comparison period stats based on timeFrame
    let comparisonStats = null;
    let comparisonLabel = '';

    if (timeFrame === 'today' || timeFrame === 'yesterday') {
      // Compare with previous day
      const prevStartDate = new Date(startDate);
      const prevEndDate = new Date(endDate);

      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate.setDate(prevEndDate.getDate() - 1);

      comparisonStats = await this.getStatisticsForDateRange(sellerID, prevStartDate, prevEndDate);
      comparisonLabel = 'previous day';
    } else if (timeFrame !== 'allTime') {
      // Compare with same period last year
      const lastYearStartDate = new Date(startDate);
      const lastYearEndDate = new Date(endDate);

      lastYearStartDate.setFullYear(lastYearStartDate.getFullYear() - 1);
      lastYearEndDate.setFullYear(lastYearEndDate.getFullYear() - 1);

      comparisonStats = await this.getStatisticsForDateRange(sellerID, lastYearStartDate, lastYearEndDate);
      comparisonLabel = 'same period last year';
    }

    // Add the change percentages to the statistics
    currentStats.changes = this.calculateChanges(currentStats, comparisonStats);
    currentStats.comparisonLabel = comparisonLabel;

    return currentStats;
  }

  /**
   * Helper method to convert time frame to actual date range
   */
  private getDateRangeFromTimeFrame(timeFrame: string): {
    startDate: Date;
    endDate: Date;
    intervalType: 'hour' | 'day' | 'month' | 'year';
  } {
    const now = new Date();
    let endDate = new Date(now);
    let startDate = new Date(now);
    let intervalType: 'hour' | 'day' | 'month' | 'year' = 'day';

    // Set hours to end of day for end date to include full day
    endDate.setHours(23, 59, 59, 999);

    switch (timeFrame) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        intervalType = 'hour';
        break;

      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        intervalType = 'hour';
        break;

      case 'last7days':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        intervalType = 'day';
        break;

      case 'last30days':
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        intervalType = 'day';
        break;

      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        intervalType = 'day';
        break;

      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        intervalType = 'month';
        break;

      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        intervalType = 'month';
        break;

      case 'allTime':
        // Use a very old date for "all time" - adjust as needed based on your data
        startDate = new Date(2000, 0, 1);
        intervalType = 'month';
        break;

      default:
        // Default to last 30 days
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        intervalType = 'day';
    }

    return { startDate, endDate, intervalType };
  }

  /**
   * Get statistics for the given date range
   */
  private async getStatisticsForDateRange(sellerID: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      // Use a single query to get revenue and order counts
      const orderStats = await AppDataSource.getRepository(Order)
        .createQueryBuilder('order')
        .innerJoin('order.product', 'product')
        .innerJoin('product.seller', 'seller')
        .where('seller.user_id = :sellerID', { sellerID }) // Using named parameter
        .andWhere('order.sold_timestamp BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .select('SUM(order.buyer_paid)', 'totalRevenue')
        .addSelect('COUNT(DISTINCT order.transaction_id)', 'totalOrders')
        .addSelect('COUNT(DISTINCT order.buyer_username)', 'activeCustomers')
        .addSelect('AVG(order.buyer_paid)', 'averageSalePrice')
        .getRawOne();

      // Get active listings count
      const activeListings = await AppDataSource.getRepository(Product)
        .createQueryBuilder('product')
        .innerJoin('product.seller', 'seller')
        .where('seller.user_id = :sellerID', { sellerID })
        .andWhere('product.status = :status', { status: ProductStatus.active })
        .getCount();

      // Get average inventory price
      const inventoryStats = await AppDataSource.getRepository(Product)
        .createQueryBuilder('product')
        .innerJoin('product.seller', 'seller')
        .where('seller.user_id = :sellerID', { sellerID })
        .andWhere('product.status = :status', { status: ProductStatus.active })
        .select('AVG(product.price)', 'averageInventoryPrice')
        .addSelect('SUM(product.price)', 'totalInventoryValue')
        .getRawOne();

      // Get turnover time (if needed)
      const averageTurnoverTime = await this.getAnalyticsAverageTurnoverTime(sellerID);

      return {
        totalRevenue: parseFloat(orderStats?.totalRevenue || '0'),
        totalOrders: parseInt(orderStats?.totalOrders || '0'),
        activeCustomers: parseInt(orderStats?.activeCustomers || '0'),
        activeListings,
        averageSalePrice: parseFloat(orderStats?.averageSalePrice || '0'),
        averageInventoryPrice: parseFloat(inventoryStats?.averageInventoryPrice || '0'),
        totalInventoryValue: parseFloat(inventoryStats?.totalInventoryValue || '0'),
        averageTurnoverTime,
      };
    } catch (error) {
      console.error('Error getting statistics for date range:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        activeCustomers: 0,
        activeListings: 0,
        averageSalePrice: 0,
        averageInventoryPrice: 0,
        totalInventoryValue: 0,
        averageTurnoverTime: 0,
      };
    }
  }

  /**
   * Get graph data for all metrics or a specific metric
   * @param sellerId Seller ID
   * @param primaryMetric Primary metric to ensure we have (revenue, orders, or listings)
   * @param startDate Start date for the data
   * @param endDate End date for the data
   * @param intervalType Interval type (hour, day, month, year)
   * @returns Array of data points with all available metrics
   */
  private async getGraphData(
    sellerId: string,
    primaryMetric: string,
    startDate: Date,
    endDate: Date,
    intervalType: 'hour' | 'day' | 'month' | 'year',
  ): Promise<any[]> {
    // Define date formats and group by expressions
    let dateFormat;
    let groupByFormat;

    // Set date format and grouping based on interval type
    switch (intervalType) {
      case 'hour':
        dateFormat = "to_char(date_trunc('hour', %DATE_FIELD%), 'YYYY-MM-DD HH24:00')";
        groupByFormat = "date_trunc('hour', %DATE_FIELD%)";
        break;
      case 'day':
        dateFormat = "to_char(date_trunc('day', %DATE_FIELD%), 'YYYY-MM-DD')";
        groupByFormat = "date_trunc('day', %DATE_FIELD%)";
        break;
      case 'month':
        dateFormat = "to_char(date_trunc('month', %DATE_FIELD%), 'YYYY-MM')";
        groupByFormat = "date_trunc('month', %DATE_FIELD%)";
        break;
      case 'year':
        dateFormat = "to_char(date_trunc('year', %DATE_FIELD%), 'YYYY')";
        groupByFormat = "date_trunc('year', %DATE_FIELD%)";
        break;
    }

    // Get revenue data
    const revenueData = await this.getMetricData(sellerId, 'revenue', startDate, endDate, dateFormat, groupByFormat);

    // Get orders data
    const ordersData = await this.getMetricData(sellerId, 'orders', startDate, endDate, dateFormat, groupByFormat);

    // Get listings data
    const listingsData = await this.getMetricData(sellerId, 'listings', startDate, endDate, dateFormat, groupByFormat);

    // Combine all data points using datePoint as the key
    const combinedDataMap = new Map();

    // Create a set of all date points
    const allDatePoints = new Set([
      ...revenueData.map((p) => p.datePoint),
      ...ordersData.map((p) => p.datePoint),
      ...listingsData.map((p) => p.datePoint),
    ]);

    // Initialize the combined data map with all date points
    for (const datePoint of allDatePoints) {
      combinedDataMap.set(datePoint, {
        datePoint,
        revenue: 0,
        orders: 0,
        listings: 0,
      });
    }

    // Add revenue data
    for (const point of revenueData) {
      const existingPoint = combinedDataMap.get(point.datePoint);
      if (existingPoint) {
        existingPoint.revenue = parseFloat(point.value) || 0;
      }
    }

    // Add orders data
    for (const point of ordersData) {
      const existingPoint = combinedDataMap.get(point.datePoint);
      if (existingPoint) {
        existingPoint.orders = parseInt(point.value) || 0;
      }
    }

    // Add listings data
    for (const point of listingsData) {
      const existingPoint = combinedDataMap.get(point.datePoint);
      if (existingPoint) {
        existingPoint.listings = parseInt(point.value) || 0;
      }
    }

    // Convert map to array
    const combinedData = Array.from(combinedDataMap.values());

    // Sort by date
    combinedData.sort((a, b) => {
      return new Date(a.datePoint).getTime() - new Date(b.datePoint).getTime();
    });

    // Fill in missing date points for continuous graph
    return this.fillMissingDatePoints(combinedData, startDate, endDate, intervalType);
  }

  /**
   * Helper method to get data for a specific metric
   */
  private async getMetricData(
    sellerId: string,
    metricType: string,

    startDate: Date,
    endDate: Date,
    dateFormat: string,
    groupByFormat: string,
  ): Promise<any[]> {
    try {
      let queryBuilder;
      let selectFields;
      let groupBy;

      // Configure query based on metric type
      switch (metricType) {
        case 'revenue':
          // Revenue data from orders
          queryBuilder = AppDataSource.getRepository(Order)
            .createQueryBuilder('order')
            .innerJoin('order.product', 'product')
            .where('product.user_id = :sellerId', { sellerId })
            .andWhere('order.sold_timestamp BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            });

          const revenueDateTrunc = groupByFormat.replace('%DATE_FIELD%', 'order.sold_timestamp');

          selectFields = {
            datePoint: dateFormat.replace('%DATE_FIELD%', 'order.sold_timestamp'),
            value: 'SUM(order.buyer_paid)',
          };

          groupBy = revenueDateTrunc;
          break;

        case 'orders':
          // Order count data
          queryBuilder = AppDataSource.getRepository(Order)
            .createQueryBuilder('order')
            .innerJoin('order.product', 'product')
            .where('product.user_id = :sellerId', { sellerId })
            .andWhere('order.sold_timestamp BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            });

          const orderDateTrunc = groupByFormat.replace('%DATE_FIELD%', 'order.sold_timestamp');

          selectFields = {
            datePoint: dateFormat.replace('%DATE_FIELD%', 'order.sold_timestamp'),
            value: 'COUNT(order.transaction_id)',
          };

          groupBy = orderDateTrunc;
          break;

        case 'listings':
          // Listings created data
          queryBuilder = AppDataSource.getRepository(Product)
            .createQueryBuilder('product')
            .where('product.user_id = :sellerId', { sellerId })
            .andWhere('product.created_at BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            });

          const listingDateTrunc = groupByFormat.replace('%DATE_FIELD%', 'product.created_at');

          selectFields = {
            datePoint: dateFormat.replace('%DATE_FIELD%', 'product.created_at'),
            value: 'COUNT(product.product_id)',
          };

          groupBy = listingDateTrunc;
          break;

        default:
          return [];
      }

      // Complete the query with fixed GROUP BY
      queryBuilder.select(`${selectFields.datePoint}`, 'datePoint').addSelect(selectFields.value, 'value').groupBy(groupBy).orderBy(groupBy, 'ASC');

      // Log generated query and parameters for debugging
      console.log(`Generated SQL for ${metricType}:`, queryBuilder.getSql());
      console.log('Parameters:', queryBuilder.getParameters());

      // Execute query
      const results = await queryBuilder.getRawMany();
      return results;
    } catch (error) {
      console.error(`Error getting ${metricType} metric data:`, error);
      return [];
    }
  }

  /**
   * Fill in missing date points for all metrics
   */
  private fillMissingDatePoints(dataPoints: any[], startDate: Date, endDate: Date, intervalType: 'hour' | 'day' | 'month' | 'year'): any[] {
    // Convert existing points to a map for quick lookup
    const pointsMap = new Map(dataPoints.map((point) => [point.datePoint, point]));

    const result = [];
    const currentDate = new Date(startDate);

    // Generate all expected date points
    while (currentDate <= endDate) {
      let datePoint;

      switch (intervalType) {
        case 'hour':
          datePoint = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:00`;
          currentDate.setHours(currentDate.getHours() + 1);
          break;

        case 'day':
          datePoint = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          currentDate.setDate(currentDate.getDate() + 1);
          break;

        case 'month':
          datePoint = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;

        case 'year':
          datePoint = `${currentDate.getFullYear()}`;
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }

      // Use existing value or create a new entry with 0 values
      if (pointsMap.has(datePoint)) {
        result.push(pointsMap.get(datePoint));
      } else {
        result.push({
          datePoint,
          revenue: 0,
          orders: 0,
          listings: 0,
        });
      }
    }

    return result;
  }

  /**
   * Get marketplace split of orders and revenue
   */
  private async getMarketplaceSplit(sellerId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const marketplaceData = await AppDataSource.getRepository(Order)
        .createQueryBuilder('order')
        .innerJoin('order.product', 'product')
        .innerJoin('product.seller', 'seller')
        .where('product.user_id = :sellerId', { sellerId })
        .andWhere('order.sold_timestamp BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .select('order.marketplace', 'marketplace')
        .addSelect('COUNT(order.transaction_id)', 'orderCount')
        .addSelect('SUM(order.buyer_paid)', 'revenue')
        .addSelect('AVG(order.buyer_paid)', 'averagePrice')
        .groupBy('order.marketplace')
        .getRawMany();

      // Format into a more frontend-friendly structure
      const result: { [key: string]: { revenue: number; items: number; averagePrice: number } } = {};

      marketplaceData.forEach((item) => {
        result[item.marketplace] = {
          revenue: parseFloat(item.revenue) || 0,
          items: parseInt(item.orderCount) || 0,
          averagePrice: parseFloat(item.averagePrice) || 0,
        };
      });

      return result;
    } catch (error) {
      console.error('Error getting marketplace split:', error);
      return {};
    }
  }

  /**
   * Format category counts into insights for the dashboard
   */
  private formatCategoryInsights(categoryCounts: { [key: string]: number }): {
    trending: Array<{ name: string; units: number; growth: number }>;
    needsAttention: Array<{ name: string; units: number; decline: number }>;
  } {
    // Convert object to array of category data objects
    const categoryArray = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      units: count,
      // Generate growth/decline percentages (in a real app, these would come from historical data)
      growth: Math.floor(Math.random() * 20) + 5,
      decline: Math.floor(Math.random() * 15) + 3,
    }));

    // Sort by count to determine trending vs needs attention
    const sortedByCount = [...categoryArray].sort((a, b) => b.units - a.units);
    const reversed = [...categoryArray].sort((a, b) => a.units - b.units);

    return {
      trending: sortedByCount.slice(0, 4).map(({ name, units, growth }) => ({
        name,
        units,
        growth,
      })),
      needsAttention: reversed.slice(0, 4).map(({ name, units, decline }) => ({
        name,
        units,
        decline,
      })),
    };
  }

  /**
   * Calculate percentage changes between current and comparison periods
   */
  private calculateChanges(current: any, comparison: any): any {
    if (!comparison) {
      return {
        revenue: null,
        orders: null,
        customers: null,
        listings: null,
        inventoryPrice: null,
        salePrice: null,
      };
    }

    const calculateChange = (current: number, previous: number): string => {
      if (previous === 0) {
        return current === 0 ? '+0.0%' : '+100.0%';
      }
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    return {
      revenue: calculateChange(current.totalRevenue, comparison.totalRevenue),
      orders: calculateChange(current.totalOrders, comparison.totalOrders),
      customers: calculateChange(current.activeCustomers, comparison.activeCustomers),
      listings: calculateChange(current.activeListings, comparison.activeListings),
      inventoryPrice: calculateChange(current.averageInventoryPrice, comparison.averageInventoryPrice),
      salePrice: calculateChange(current.averageSalePrice, comparison.averageSalePrice),
    };
  }

  async searchSellerProducts(params: { sellerId: string; query?: string; page?: number; limit?: number }): Promise<PaginatedProducts> {
    try {
      const { sellerId, query, page = 1, limit = 10 } = params;

      const productRepository = AppDataSource.getRepository(Product);

      // Create a single chained query
      const queryBuilder = productRepository
        .createQueryBuilder('product')
        .where('product.user_id = :sellerId', { sellerId })
        .leftJoinAndSelect('product.imageURLS', 'imageURLS')
        .orderBy('product.created_at', 'DESC');

      // Add text search if query provided
      if (query) {
        queryBuilder.andWhere('(product.title ILIKE :query OR product.description ILIKE :query)', { query: `%${query}%` });
      }

      // Get total count before pagination
      const total = await queryBuilder.getCount();

      // Apply pagination and get results
      const products = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in searchSellerProducts:', error);
      throw error;
    }
  }
}
