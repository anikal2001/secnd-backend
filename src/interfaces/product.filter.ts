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
  marketplaces?: string[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export type ExtendedProduct = Omit<Product, 'generateId' | 'marketplaces'> & {
  generateId?: () => void;
  marketplaces?: string[];
  marketplaceListings: any[];
};

export interface PaginatedProducts {
  products: ExtendedProduct[];
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
