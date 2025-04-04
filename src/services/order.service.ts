import { Order } from '../entity/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ProductStatus } from '../utils/products.enums';

interface CreateOrderDTO {
  product_id?: string;
  marketplace: string;
  marketplace_order_id: string;
  marketplace_listing_id?: string;
  marketplace_transaction_id?: string;
  buyer_paid?: number;
  seller_paid?: number;
  tax_amount?: number;
  currency?: string;
  sold_timestamp?: Date | string;
  buyer_username?: string;
  buyer_address?: {
    name?: string;
    street_address?: string;
    address2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  shipping_status?: string;
  shipping_method?: string;
  tracking_number?: string;
  shipping_carrier?: string;
}

export class OrderService {
  private orderRepository = OrderRepository;
  private productRepository = ProductRepository;

  /**
   * Create a new order record
   * @param data The order data
   * @returns The created order
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    try {
      // Check if order already exists to avoid duplicates
      const existingOrder = await this.findExistingOrder(data.marketplace, data.marketplace_order_id);
      if (existingOrder) {
        return existingOrder;
      }

      const order = new Order();

      // Set up product relationship if provided
      if (data.product_id) {
        // First find the product
        const product = await this.productRepository.findOneBy({
          product_id: data.product_id,
        });

        if (!product) {
          throw new Error(`Product with ID ${data.product_id} not found`);
        }

        // Set the product relationship
        order.product = product;

        // Update product status to sold - using the correct approach
        product.status = ProductStatus.sold;
        await this.productRepository.save(product);
      }

      // Map all data fields to the entity
      Object.assign(order, data);

      // Handle date conversion if needed
      if (data.sold_timestamp && typeof data.sold_timestamp === 'string') {
        order.sold_timestamp = new Date(data.sold_timestamp);
      }

      // Save the order
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get all orders for a product
   * @param productId The product ID
   * @returns Array of orders for the product
   */
  async getOrdersByProductId(productId: string): Promise<Order[]> {
    return await this.orderRepository.findByProductId(productId);
  }

  /**
   * Check if an order already exists in the database
   * @param marketplace The marketplace name
   * @param orderId The marketplace order ID
   * @returns The existing order or null
   */
  async findExistingOrder(marketplace: string, orderId: string): Promise<Order | null> {
    return await this.orderRepository.findByMarketplaceOrderId(marketplace, orderId);
  }

  /**
   * Get recent orders with pagination
   * @param limit Number of orders to return
   * @param page Page number for pagination
   * @returns Array of recent orders
   */
  async getRecentOrders(limit: number = 10, page: number = 1): Promise<Order[]> {
    const skip = (page - 1) * limit;
    return await this.orderRepository.find({
      order: { sold_timestamp: 'DESC' },
      take: limit,
      skip: skip,
      relations: ['product'],
    });
  }

  /**
   * Update shipping information for an order
   * @param transactionId The transaction ID
   * @param shippingData The shipping data to update
   */
  async updateShippingInfo(
    transactionId: string,
    shippingData: {
      shipping_status?: string;
      tracking_number?: string;
      shipping_carrier?: string;
      shipping_method?: string;
    },
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOneBy({ transaction_id: transactionId });

    if (!order) {
      return null;
    }

    // Update the fields
    Object.assign(order, shippingData);

    return await this.orderRepository.save(order);
  }

  /**
   * Get order statistics grouped by marketplace
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   */
  async getOrderStats(startDate?: Date, endDate?: Date): Promise<any> {
    return await this.orderRepository.getOrderStats(startDate, endDate);
  }

  /**
   * Get order statistics grouped by product category
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   */
  async getCategoryStats(startDate?: Date, endDate?: Date): Promise<any> {
    return await this.orderRepository.getCategoryStats(startDate, endDate);
  }

  /**
   * Get monthly revenue data for a specific year
   * @param year The year to get data for
   */
  async getMonthlyRevenue(year: number = new Date().getFullYear()): Promise<any> {
    return await this.orderRepository.getMonthlyRevenue(year);
  }

  /**
   * Get daily revenue for a date range
   * @param startDate Start date
   * @param endDate End date
   */
  async getDailyRevenue(startDate: Date, endDate: Date): Promise<any> {
    return await this.orderRepository.getDailyRevenue(startDate, endDate);
  }

  /**
   * Get top selling products
   * @param limit Maximum number of products to return
   * @param startDate Optional start date for filtering
   * @param endDate Optional end date for filtering
   */
  async getTopSellingProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any> {
    return await this.orderRepository.getTopSellingProducts(limit, startDate, endDate);
  }

  /**
   * Convert marketplace API order to order data
   * @param orderData Order data from marketplace API
   * @param marketplace The marketplace name
   * @param productId Optional product ID if known
   */
  convertApiToOrderData(orderData: any, marketplace: string, productId?: string): CreateOrderDTO {
    // Base order data
    const orderDTO: CreateOrderDTO = {
      marketplace,
      marketplace_order_id: '',
      product_id: productId,
    };

    if (marketplace === 'etsy') {
      // Process Etsy order
      const transaction = orderData.transactions?.[0] || {};

      orderDTO.marketplace_order_id = orderData.order_id?.toString();
      orderDTO.marketplace_listing_id = transaction.listing_id?.toString();
      orderDTO.marketplace_transaction_id = transaction.transaction_id?.toString();

      // Handle financial data
      const costBreakdown = orderData.payment?.cost_breakdown;
      if (costBreakdown) {
        // Etsy prices are in smallest units (cents), so divide by 100
        orderDTO.buyer_paid = costBreakdown.total_cost?.value ? parseFloat((costBreakdown.total_cost.value / 100).toFixed(2)) : undefined;

        // Estimate seller payout (total minus fees)
        const fees = (costBreakdown.tax_cost?.value || 0) / 100;
        orderDTO.seller_paid = orderDTO.buyer_paid ? orderDTO.buyer_paid - fees : undefined;

        orderDTO.tax_amount = costBreakdown.tax_cost?.value ? parseFloat((costBreakdown.tax_cost.value / 100).toFixed(2)) : undefined;

        orderDTO.currency = costBreakdown.total_cost?.currency_code;
      }

      // Handle dates - Etsy timestamps are in seconds
      if (orderData.order_date) {
        orderDTO.sold_timestamp = new Date(orderData.order_date * 1000);
      }

      // Shipping details
      const fulfillment = orderData.fulfillment;
      if (fulfillment) {
        orderDTO.shipping_status = fulfillment.was_shipped ? 'shipped' : 'awaitingShipping';
        orderDTO.shipping_method = fulfillment.shipping_method;

        // Address
        const toAddress = fulfillment.to_address;
        if (toAddress) {
          orderDTO.buyer_address = {
            name: toAddress.name,
            street_address: toAddress.first_line,
            address2: toAddress.second_line,
            city: toAddress.city,
            state: toAddress.state,
            country: toAddress.country,
            postal_code: toAddress.zip,
          };
        }
      }

      // Buyer details
      const buyer = orderData.buyer_id ? { name: orderData.buyerUsername } : null;
      orderDTO.buyer_username = buyer?.name || fulfillment?.to_address?.name;
    } else if (marketplace === 'depop') {
      // Process Depop order
      orderDTO.marketplace_order_id = orderData.purchaseId?.toString();
      orderDTO.marketplace_listing_id = orderData.items?.[0]?.productId?.toString();
      orderDTO.marketplace_transaction_id = orderData.transactionId?.toString();

      // Financial data
      orderDTO.buyer_paid = orderData.buyerPaidAmount ? parseFloat(orderData.buyerPaidAmount) : undefined;
      orderDTO.seller_paid = orderData.sellerPaidAmount ? parseFloat(orderData.sellerPaidAmount) : undefined;
      orderDTO.currency = orderData.currency;

      // Timestamps
      if (orderData.soldTimestamp) {
        orderDTO.sold_timestamp = new Date(orderData.soldTimestamp);
      }

      // Buyer details
      orderDTO.buyer_username = orderData.buyer?.username;

      // Shipping details
      orderDTO.shipping_status = orderData.shippingStatus;

      // Address
      const address = orderData.shippingAddress;
      if (address) {
        orderDTO.buyer_address = {
          name: address.name,
          street_address: address.address,
          address2: address.address2,
          city: address.city,
          state: address.state,
          country: address.country,
          postal_code: address.postcode,
        };
      }

      // Shipping carrier
      if (orderData.parcels && orderData.parcels.length > 0) {
        orderDTO.shipping_carrier = orderData.parcels[0].shippingProvider;
      }
    } else if (marketplace === 'shopify') {
      // Process Shopify order (basic implementation)
      if (orderData.id) {
        orderDTO.marketplace_order_id = orderData.id.toString();
      }

      // Add additional Shopify-specific mapping here
      // This would need to be expanded based on Shopify's API response format
    }

    return orderDTO;
  }

  /**
   * Find an order by its transaction ID
   * @param transactionId The transaction ID
   * @returns The order or null if not found
   */
  async findByTransactionId(transactionId: string): Promise<Order | null> {
    return await this.orderRepository.findByTransactionId(transactionId);
  }

  /**
   * Get orders for a specific seller
   * @param sellerId The seller's user ID
   * @param limit Maximum number of orders to return
   * @returns Array of orders for the seller
   */
  async getOrdersBySellerId(sellerId: string, limit: number = 50): Promise<Order[]> {
    return await this.orderRepository.findBySellerId(sellerId, limit);
  }

  /**
   * Get order counts by shipping status
   * @param sellerId Optional seller ID to filter by
   * @returns Statistics on order shipping statuses
   */
  async getOrderStatusCounts(sellerId?: string): Promise<any> {
    return await this.orderRepository.getOrderCountsByStatus(sellerId);
  }

  /**
   * Search orders with various filters
   * @param searchParams Search parameters
   * @returns Matching orders and total count
   */
  async searchOrders(searchParams: {
    marketplace?: string;
    shipping_status?: string;
    buyer_username?: string;
    product_id?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    seller_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    // Create a clean params object with proper types for the repository
    const cleanParams: {
      marketplace?: string;
      shipping_status?: string;
      buyer_username?: string;
      product_id?: string;
      startDate?: Date;
      endDate?: Date;
      seller_id?: string;
      page?: number;
      limit?: number;
    } = {
      marketplace: searchParams.marketplace,
      shipping_status: searchParams.shipping_status,
      buyer_username: searchParams.buyer_username,
      product_id: searchParams.product_id,
      seller_id: searchParams.seller_id,
      page: searchParams.page,
      limit: searchParams.limit,
    };

    // Convert date strings to Date objects
    if (searchParams.startDate) {
      cleanParams.startDate = typeof searchParams.startDate === 'string' ? new Date(searchParams.startDate) : searchParams.startDate;
    }

    if (searchParams.endDate) {
      cleanParams.endDate = typeof searchParams.endDate === 'string' ? new Date(searchParams.endDate) : searchParams.endDate;
    }

    return await this.orderRepository.searchOrders(cleanParams);
  }
  /**
   * Calculate sales summary for a seller
   * @param sellerId The seller's user ID
   * @param period 'day', 'week', 'month', or 'year'
   * @returns Sales summary statistics
   */
  async getSellerSalesSummary(sellerId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get all seller orders for the period
    const orders = await this.orderRepository.query(
      `
      SELECT 
        o.marketplace,
        COUNT(o.transaction_id) as order_count,
        SUM(o.buyer_paid) as total_sales,
        SUM(o.seller_paid) as total_revenue,
        AVG(o.buyer_paid) as avg_order_value
      FROM 
        "order" o
      JOIN 
        product p ON o.product_id = p.product_id
      JOIN 
        seller s ON p.user_id = s.user_id
      WHERE 
        s.user_id = $1 AND
        o.sold_timestamp BETWEEN $2 AND $3
      GROUP BY 
        o.marketplace
    `,
      [sellerId, startDate, endDate],
    );

    // Get total counts
    const totals = {
      order_count: orders.reduce((sum: number, row: any) => sum + parseInt(row.order_count || '0'), 0),
      total_sales: orders.reduce((sum: number, row: any) => sum + parseFloat(row.total_sales || '0'), 0),
      total_revenue: orders.reduce((sum: number, row: any) => sum + parseFloat(row.total_revenue || '0'), 0),
      avg_order_value: 0,
    };

    // Calculate overall average if there are orders
    if (totals.order_count > 0) {
      totals.avg_order_value = totals.total_sales / totals.order_count;
    }

    return {
      period,
      timeRange: {
        startDate,
        endDate,
      },
      totalSummary: totals,
      marketplaceSummary: orders,
    };
  }

  /**
   * Mark an order as shipped with tracking information
   * @param transactionId Order transaction ID
   * @param trackingInfo Tracking information
   * @returns Updated order
   */
  async markAsShipped(
    transactionId: string,
    trackingInfo: {
      tracking_number: string;
      shipping_carrier: string;
      shipping_method?: string;
    },
  ): Promise<Order | null> {
    const order = await this.findByTransactionId(transactionId);

    if (!order) {
      return null;
    }

    // Update shipping information
    order.shipping_status = 'shipped';
    order.tracking_number = trackingInfo.tracking_number;
    order.shipping_carrier = trackingInfo.shipping_carrier;

    if (trackingInfo.shipping_method) {
      order.shipping_method = trackingInfo.shipping_method;
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Get inventory turnover metrics by category
   * @returns Turnover data by product category
   */
  async getInventoryTurnover(): Promise<any> {
    return await this.orderRepository.query(`
      SELECT 
        p.category,
        AVG(EXTRACT(EPOCH FROM (o.sold_timestamp - p.created_at))) / 86400 as avg_days_to_sell,
        COUNT(o.transaction_id) as sold_count
      FROM 
        "order" o
      JOIN 
        product p ON o.product_id = p.product_id
      WHERE 
        p.created_at IS NOT NULL AND o.sold_timestamp IS NOT NULL
      GROUP BY 
        p.category
      ORDER BY 
        avg_days_to_sell
    `);
  }

  /**
   * Get marketplace performance comparison
   * @param startDate Start date for analysis
   * @param endDate End date for analysis
   * @returns Marketplace performance statistics
   */
  async getMarketplacePerformance(startDate: Date, endDate: Date): Promise<any> {
    // Get comparative stats for marketplaces
    const marketplaceStats = await this.orderRepository.query(
      `
      SELECT 
        marketplace,
        COUNT(*) as order_count,
        SUM(buyer_paid) as total_sales,
        SUM(seller_paid) as total_revenue,
        AVG(buyer_paid) as avg_order_value,
        AVG(EXTRACT(EPOCH FROM (created_at - sold_timestamp)) / 3600) as avg_processing_time_hours
      FROM 
        "order"
      WHERE 
        sold_timestamp BETWEEN $1 AND $2
      GROUP BY 
        marketplace
      ORDER BY 
        total_revenue DESC
    `,
      [startDate, endDate],
    );

    // Get trend data by month for each marketplace
    const marketplaceTrends = await this.orderRepository.query(
      `
      SELECT 
        DATE_TRUNC('month', sold_timestamp) as month,
        marketplace,
        COUNT(*) as order_count,
        SUM(seller_paid) as revenue
      FROM 
        "order"
      WHERE 
        sold_timestamp BETWEEN $1 AND $2
      GROUP BY 
        DATE_TRUNC('month', sold_timestamp), marketplace
      ORDER BY 
        month, marketplace
    `,
      [startDate, endDate],
    );

    return {
      marketplaceStats,
      marketplaceTrends,
    };
  }

  async getAnalyticsAverageTurnoverTime(sellerID: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<number> {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get orders with date filtering
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.product', 'product')
      .innerJoin('product.seller', 'seller')
      .where('seller.user_id = :sellerID', { sellerID })
      .andWhere('order.sold_timestamp IS NOT NULL')
      .andWhere('order.sold_timestamp >= :startDate', { startDate })
      .select('order.sold_timestamp', 'sold_timestamp')
      .addSelect('product.created_at', 'created_at')
      .getRawMany();

    if (!orders?.length) return 0;

    // Calculate average with null checks
    const totalTurnoverTime = orders.reduce((acc, order) => {
      const createdDate = order.created_at ? new Date(order.created_at).getTime() : 0;
      const soldDate = order.sold_timestamp ? new Date(order.sold_timestamp).getTime() : 0;

      if (!createdDate || !soldDate) return acc;

      return acc + (soldDate - createdDate) / (1000 * 60 * 60 * 24); // Days
    }, 0);

    return totalTurnoverTime / orders.length;
  }
}
