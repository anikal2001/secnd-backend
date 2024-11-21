import { ProductCategory, ProductStatus } from '../utils/products.enums';
import { Product } from '../entity/product.entity';

export interface ProductFilter {
  category?: ProductCategory;
  status?: ProductStatus;
  startDate?: Date;
  endDate?: Date;
  sellerId: string;
  includeImages?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
