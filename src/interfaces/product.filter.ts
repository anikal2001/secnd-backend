import { ProductStatus } from '../utils/products.enums';
import { Category } from "../utils/product/category"
import { Product } from '../entity/product.entity';

export interface ProductFilter {
  category?: Category;
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
  products: Product[]
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedDrafts {
  drafts: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
