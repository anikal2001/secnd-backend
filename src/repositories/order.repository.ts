import { AppDataSource } from '../database/config';
import { Order } from '../entity/order.entity';
import { Between, Like } from 'typeorm';

export const OrderRepository = AppDataSource.getRepository(Order).extend({
  async findByProductId(productId: string): Promise<Order[]> {
    return this.find({
      where: { product: { product_id: productId } },
      relations: ['product'],
    });
  },

  async findByMarketplaceOrderId(marketplace: string, marketplaceOrderId: string): Promise<Order | null> {
    return this.findOne({
      where: {
        marketplace,
        marketplace_order_id: marketplaceOrderId,
      },
      relations: ['product'],
    });
  },

  async findByMarketplaceListingId(marketplace: string, marketplaceListingId: string): Promise<Order | null> {
    return this.findOne({
      where: {
        marketplace,
        marketplace_listing_id: marketplaceListingId,
      },
      relations: ['product'],
    });
  },

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return this.find({
      order: { sold_timestamp: 'DESC' },
      take: limit,
      relations: ['product'],
    });
  },

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.find({
      where: {
        sold_timestamp: Between(startDate, endDate),
      },
      relations: ['product'],
      order: { sold_timestamp: 'DESC' },
    });
  },

  async getOrdersByMarketplace(marketplace: string, limit: number = 50): Promise<Order[]> {
    return this.find({
      where: { marketplace },
      order: { sold_timestamp: 'DESC' },
      take: limit,
      relations: ['product'],
    });
  },

  async getOrderStats(startDate?: Date, endDate?: Date): Promise<any> {
    // Create base query
    let queryBuilder = this.createQueryBuilder('order')
      .select('SUM(order.buyer_paid)', 'totalSales')
      .addSelect('SUM(order.seller_paid)', 'totalSellerRevenue')
      .addSelect('SUM(order.tax_amount)', 'totalTax')
      .addSelect('COUNT(order.transaction_id)', 'orderCount')
      .addSelect('order.marketplace', 'marketplace')
      .groupBy('order.marketplace');

    // Add date range if provided
    if (startDate && endDate) {
      queryBuilder = queryBuilder.where('order.sold_timestamp BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return queryBuilder.getRawMany();
  },

  async getCategoryStats(startDate?: Date, endDate?: Date): Promise<any> {
    // Create base query that joins with product to get category info
    let queryBuilder = this.createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .select('product.category', 'category')
      .addSelect('COUNT(order.transaction_id)', 'orderCount')
      .addSelect('SUM(order.buyer_paid)', 'totalSales')
      .groupBy('product.category');

    // Add date range if provided
    if (startDate && endDate) {
      queryBuilder = queryBuilder.where('order.sold_timestamp BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return queryBuilder.getRawMany();
  },

  async getMonthlyRevenue(year: number): Promise<any> {
    return this.query(
      `
      SELECT 
        EXTRACT(MONTH FROM sold_timestamp) as month,
        SUM(buyer_paid) as total_sales,
        SUM(seller_paid) as total_revenue,
        COUNT(transaction_id) as order_count
      FROM "order"
      WHERE 
        EXTRACT(YEAR FROM sold_timestamp) = $1
      GROUP BY 
        EXTRACT(MONTH FROM sold_timestamp)
      ORDER BY 
        month
    `,
      [year],
    );
  },

  async getDailyRevenue(startDate: Date, endDate: Date): Promise<any> {
    return this.query(
      `
      SELECT 
        DATE(sold_timestamp) as date,
        SUM(buyer_paid) as total_sales,
        SUM(seller_paid) as total_revenue,
        COUNT(transaction_id) as order_count
      FROM "order"
      WHERE 
        sold_timestamp BETWEEN $1 AND $2
      GROUP BY 
        DATE(sold_timestamp)
      ORDER BY 
        date
    `,
      [startDate, endDate],
    );
  },

  async getTopSellingProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any> {
    // Create base query that joins with product
    let queryBuilder = this.createQueryBuilder('order')
      .leftJoin('order.product', 'product')
      .select('product.product_id', 'productId')
      .addSelect('product.title', 'productTitle')
      .addSelect('product.category', 'category')
      .addSelect('COUNT(order.transaction_id)', 'orderCount')
      .addSelect('SUM(order.buyer_paid)', 'totalSales')
      .groupBy('product.product_id, product.title, product.category')
      .orderBy('orderCount', 'DESC')
      .limit(limit);

    // Add date range if provided
    if (startDate && endDate) {
      queryBuilder = queryBuilder.where('order.sold_timestamp BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return queryBuilder.getRawMany();
  },

  /**
   * Find an order by its transaction ID
   * @param transactionId The transaction ID
   * @returns The order or null if not found
   */
  async findByTransactionId(transactionId: string): Promise<Order | null> {
    return this.findOne({
      where: { transaction_id: transactionId },
      relations: ['product', 'product.seller'],
    });
  },

  /**
   * Find orders by seller ID
   * @param sellerId The seller's user ID
   * @param limit Maximum number of orders to return
   * @returns Array of orders for the seller
   */
  async findBySellerId(sellerId: string, limit: number = 50): Promise<Order[]> {
    return this.find({
      where: { product: { seller: { user_id: sellerId } } },
      relations: ['product', 'product.seller'],
      order: { sold_timestamp: 'DESC' },
      take: limit,
    });
  },

  /**
   * Get order counts by status
   * @param sellerId Optional seller ID to filter by
   * @returns Count of orders by shipping status
   */
  async getOrderCountsByStatus(sellerId?: string): Promise<any> {
    let queryBuilder = this.createQueryBuilder('order')
      .select('order.shipping_status', 'status')
      .addSelect('COUNT(order.transaction_id)', 'count')
      .groupBy('order.shipping_status');

    if (sellerId) {
      queryBuilder = queryBuilder
        .innerJoin('order.product', 'product')
        .innerJoin('product.seller', 'seller')
        .where('seller.user_id = :sellerId', { sellerId });
    }

    return queryBuilder.getRawMany();
  },

  /**
   * Search orders by various criteria
   * @param query Search parameters
   * @returns Matching orders
   */
  async searchOrders(query: {
    marketplace?: string;
    shipping_status?: string;
    buyer_username?: string;
    product_id?: string;
    startDate?: Date;
    endDate?: Date;
    seller_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (query.marketplace) {
      whereClause.marketplace = query.marketplace;
    }

    if (query.shipping_status) {
      whereClause.shipping_status = query.shipping_status;
    }

    if (query.buyer_username) {
      whereClause.buyer_username = Like(`%${query.buyer_username}%`);
    }

    if (query.product_id) {
      whereClause.product = { product_id: query.product_id };
    }

    if (query.startDate && query.endDate) {
      whereClause.sold_timestamp = Between(query.startDate, query.endDate);
    }

    if (query.seller_id) {
      // For seller_id, we need a more complex where clause with joins
      const queryBuilder = this.createQueryBuilder('order')
        .innerJoin('order.product', 'product')
        .innerJoin('product.seller', 'seller')
        .where('seller.user_id = :sellerId', { sellerId: query.seller_id });

      // Add other conditions
      Object.entries(whereClause).forEach(([key, value]) => {
        if (key !== 'product') {
          // Skip product since we're already joining it
          queryBuilder.andWhere(`order.${key} = :${key}`, { [key]: value });
        }
      });

      const [orders, total] = await queryBuilder.orderBy('order.sold_timestamp', 'DESC').skip(skip).take(limit).getManyAndCount();

      return { orders, total };
    }

    // Simple query without seller filter
    const [orders, total] = await this.findAndCount({
      where: whereClause,
      relations: ['product', 'product.seller'],
      order: { sold_timestamp: 'DESC' },
      skip,
      take: limit,
    });

    return { orders, total };
  },

  /**
   * Get analytics overview
   * @returns Analytics overview data
   */
  async getAnalyticsOverview(): Promise<any> {
    const [totalOrders, totalRevenue, totalTax] = await Promise.all([
      this.count(),
      this.createQueryBuilder('order')
        .select('SUM(order.buyer_paid)', 'totalRevenue')
        .getRawOne(),
      this.createQueryBuilder('order')
        .select('SUM(order.tax_amount)', 'totalTax')
        .getRawOne(),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue.totalRevenue,
      totalTax: totalTax.totalTax,
    };
  },
});
