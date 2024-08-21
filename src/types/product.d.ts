import { ProductColors, ProductSize, ProductTags } from '../utils/products.enums';

export type ProductType = {
  product_id: string;
  name: string;
  description: string;
  price: number;
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };
  listed_size: ProductSize;
  product_category: string;
  condition: string;
  tags: ProductTags[];
  brand: string;
  material: string[];
  gender: string;
  seller: number;
  imageUrls: string[];
};

export type ProductFilters = {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  lowerPrice?: number;
  upperPrice?: number;
  condition?: string;
}
