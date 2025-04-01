import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';

export class OrderController {
  static orderService: OrderService = new OrderService();
  static productService: ProductService = new ProductService();

  constructor() {
    // Initialize any needed properties
  }

  /**
   * Get all orders with pagination
   */
  public getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const orders = await OrderController.orderService.getRecentOrders(limit, page);

      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          hasMore: orders.length === limit,
        },
      });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message,
      });
    }
  };

  /**
   * Get a specific order by ID
   */
  public getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
        return;
      }

      const order = await OrderController.orderService.findByTransactionId(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order',
        error: error.message,
      });
    }
  };

  /**
   * Get orders for a specific product
   */
  public getOrdersByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = req.params.productId;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
        return;
      }

      const orders = await OrderController.orderService.getOrdersByProductId(productId);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.error('Error fetching product orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product orders',
        error: error.message,
      });
    }
  };

  /**
   * Update shipping information for an order
   */
  public updateShipping = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const shippingData = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
        return;
      }

      // Validate shipping data
      const validFields = ['shipping_status', 'tracking_number', 'shipping_carrier', 'shipping_method'];

      const filteredData = Object.entries(shippingData)
        .filter(([key]) => validFields.includes(key))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      if (Object.keys(filteredData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid shipping data provided',
        });
        return;
      }

      const updatedOrder = await OrderController.orderService.updateShippingInfo(orderId, filteredData as any);

      if (!updatedOrder) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedOrder,
      });
    } catch (error: any) {
      console.error('Error updating shipping info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shipping information',
        error: error.message,
      });
    }
  };

  /**
   * Get analytics overview with key metrics
   */
  public getAnalyticsOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Default to last 30 days

      if (req.query.startDate) {
        startDate.setTime(new Date(req.query.startDate as string).getTime());
      }

      if (req.query.endDate) {
        endDate.setTime(new Date(req.query.endDate as string).getTime());
      }

      // Get order stats
      const orderStats = await OrderController.orderService.getOrderStats(startDate, endDate);

      // Get top selling products
      const topProducts = await OrderController.orderService.getTopSellingProducts(5, startDate, endDate);

      // Get daily revenue for trend analysis
      const dailyRevenue = await OrderController.orderService.getDailyRevenue(startDate, endDate);

      // Calculate total revenue
      const totalRevenue = orderStats.reduce((sum: number, stat: any) => sum + parseFloat(stat.totalSellerRevenue || '0'), 0);

      // Calculate total sales
      const totalSales = orderStats.reduce((sum: number, stat: any) => sum + parseFloat(stat.totalSales || '0'), 0);

      res.status(200).json({
        success: true,
        data: {
          timeRange: {
            startDate,
            endDate,
          },
          metrics: {
            totalRevenue,
            totalSales,
            orderCount: orderStats.reduce((sum: number, stat: any) => sum + parseInt(stat.orderCount || '0'), 0),
            avgOrderValue: totalSales / (orderStats.reduce((sum: number, stat: any) => sum + parseInt(stat.orderCount || '0'), 0) || 1),
          },
          marketplaceBreakdown: orderStats,
          topProducts,
          revenueChart: dailyRevenue,
        },
      });
    } catch (error: any) {
      console.error('Error generating analytics overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate analytics overview',
        error: error.message,
      });
    }
  };

  /**
   * Get order statistics by marketplace
   */
  public getOrderStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse date range
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const stats = await OrderController.orderService.getOrderStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics',
        error: error.message,
      });
    }
  };

  /**
   * Get order statistics by product category
   */
  public getCategoryStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse date range
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const stats = await OrderController.orderService.getCategoryStats(startDate, endDate);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching category stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category statistics',
        error: error.message,
      });
    }
  };

  /**
   * Get monthly revenue data
   */
  public getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const revenue = await OrderController.orderService.getMonthlyRevenue(year);

      res.status(200).json({
        success: true,
        data: revenue,
      });
    } catch (error: any) {
      console.error('Error fetching monthly revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly revenue',
        error: error.message,
      });
    }
  };

  /**
   * Get daily revenue data
   */
  public getDailyRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
      // Default to last 30 days if no dates provided
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();

      if (!req.query.startDate) {
        startDate.setDate(startDate.getDate() - 30);
      }

      const revenue = await OrderController.orderService.getDailyRevenue(startDate, endDate);

      res.status(200).json({
        success: true,
        data: revenue,
      });
    } catch (error: any) {
      console.error('Error fetching daily revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily revenue',
        error: error.message,
      });
    }
  };

  /**
   * Get top selling products
   */
  public getTopSellingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const products = await OrderController.orderService.getTopSellingProducts(limit, startDate, endDate);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      console.error('Error fetching top products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top selling products',
        error: error.message,
      });
    }
  };

  /**
   * Get inventory turnover metrics
   */
  public getInventoryTurnover = async (req: Request, res: Response): Promise<void> => {
    try {
      const turnoverData = await OrderController.orderService.getInventoryTurnover();

      res.status(200).json({
        success: true,
        data: turnoverData,
      });
    } catch (error: any) {
      console.error('Error calculating inventory turnover:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate inventory turnover',
        error: error.message,
      });
    }
  };

  /**
   * Get marketplace performance comparison
   */
  public getMarketplacePerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      // Default to last 6 months if no dates provided
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();

      if (!req.query.startDate) {
        startDate.setMonth(startDate.getMonth() - 6);
      }

      const performanceData = await OrderController.orderService.getMarketplacePerformance(startDate, endDate);

      res.status(200).json({
        success: true,
        data: performanceData,
      });
    } catch (error: any) {
      console.error('Error calculating marketplace performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate marketplace performance',
        error: error.message,
      });
    }
  };
  
  /**
   * Manual order creation (for testing or admin purposes)
   */
  public createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData = req.body;

      // Validate required fields
      if (!orderData.marketplace || !orderData.marketplace_order_id) {
        res.status(400).json({
          success: false,
          message: 'Marketplace and marketplace order ID are required',
        });
        return;
      }

      // Check if order already exists
      const existingOrder = await OrderController.orderService.findExistingOrder(orderData.marketplace, orderData.marketplace_order_id);

      if (existingOrder) {
        res.status(400).json({
          success: false,
          message: 'Order already exists',
          data: existingOrder,
        });
        return;
      }

      // If product_id is provided, verify it exists
      if (orderData.product_id) {
        const product = await OrderController.productService.getProductById(orderData.product_id);
        if (!product) {
          res.status(404).json({
            success: false,
            message: 'Product not found',
          });
          return;
        }
      }

      const order = await OrderController.orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message,
      });
    }
  };

  /**
   * Get orders for a specific seller
   */
  public getSellerOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.params.sellerId;

      if (!sellerId) {
        res.status(400).json({
          success: false,
          message: 'Seller ID is required',
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const orders = await OrderController.orderService.getOrdersBySellerId(sellerId, limit);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      console.error('Error fetching seller orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch seller orders',
        error: error.message,
      });
    }
  };

  /**
   * Search orders with filters
   */
  public searchOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      // Create a params object from query parameters
      const searchParams: {
        marketplace?: string;
        shipping_status?: string;
        buyer_username?: string;
        product_id?: string;
        startDate?: string;
        endDate?: string;
        seller_id?: string;
        page?: number;
        limit?: number;
      } = {};

      // Copy query parameters to our object with proper typing
      if (req.query.marketplace) searchParams.marketplace = req.query.marketplace as string;
      if (req.query.shipping_status) searchParams.shipping_status = req.query.shipping_status as string;
      if (req.query.buyer_username) searchParams.buyer_username = req.query.buyer_username as string;
      if (req.query.product_id) searchParams.product_id = req.query.product_id as string;
      if (req.query.startDate) searchParams.startDate = req.query.startDate as string;
      if (req.query.endDate) searchParams.endDate = req.query.endDate as string;
      if (req.query.seller_id) searchParams.seller_id = req.query.seller_id as string;

      // Parse numeric values
      if (req.query.page) {
        searchParams.page = parseInt(req.query.page as string);
      }

      if (req.query.limit) {
        searchParams.limit = parseInt(req.query.limit as string);
      }

      // Execute search
      const result = await OrderController.orderService.searchOrders(searchParams);

      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
        },
      });
    } catch (error: any) {
      console.error('Error searching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search orders',
        error: error.message,
      });
    }
  };

  /**
   * Get order status counts
   */
  public getOrderStatusCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.query.sellerId as string;
      const statusCounts = await OrderController.orderService.getOrderStatusCounts(sellerId);

      res.status(200).json({
        success: true,
        data: statusCounts,
      });
    } catch (error: any) {
      console.error('Error fetching order status counts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order status counts',
        error: error.message,
      });
    }
  };

  /**
   * Get sales summary for a seller
   */
  public getSellerSalesSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.params.sellerId;
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';

      if (!sellerId) {
        res.status(400).json({
          success: false,
          message: 'Seller ID is required',
        });
        return;
      }

      const summary = await OrderController.orderService.getSellerSalesSummary(sellerId, period);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error('Error generating sales summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate sales summary',
        error: error.message,
      });
    }
  };

  /**
   * Mark an order as shipped
   */
  public markAsShipped = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const trackingInfo = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
        return;
      }

      // Validate tracking information
      if (!trackingInfo.tracking_number || !trackingInfo.shipping_carrier) {
        res.status(400).json({
          success: false,
          message: 'Tracking number and shipping carrier are required',
        });
        return;
      }

      const updatedOrder = await OrderController.orderService.markAsShipped(orderId, trackingInfo);

      if (!updatedOrder) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order marked as shipped',
        data: updatedOrder,
      });
    } catch (error: any) {
      console.error('Error marking order as shipped:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark order as shipped',
        error: error.message,
      });
    }
  };
}
