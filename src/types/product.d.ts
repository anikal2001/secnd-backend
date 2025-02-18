import { ProductColors, ProductSize, ProductTags } from '../utils/products.enums';

export type ProductType = {
  user_id: string;
  product_id: string;
  title: string;
  description: string;
  price: number;
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };
  listed_size: ProductSize;
  category: string;
  condition: string;
  tags: ProductTags[];
  brand: string;
  material: string[];
  gender: string;
  images?: File[];
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