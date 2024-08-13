import { ProductColors, ProductTags } from '../utils/products.enums';

export type ProductType = {
  name: string;
  description: string;
  seller: string;
  price: number;
  primaryColors: ProductColors[];
  secondaryColors: ProductColors[];
  size: string;
  category: string;
  condition: string;
  tags: ProductTags[];
  brand: string;
  material: string[];
  gender: string;
  seller: string;
  imageUrls: string[];
};
