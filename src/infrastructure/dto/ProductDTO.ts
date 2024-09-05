import { ProductCategory, ProductColors, ProductTags} from '../../utils/products.enums';
export class ProductDto {
  product_id: string;
  name: string;
  description: string;
  price: number;
  color: {
    primaryColor: ProductColors[];
    secondaryColor: ProductColors[];
  };
  listed_size: string;
  product_category: ProductCategory;
  brand: string;
  gender: string;
  tags: ProductTags[];
  imageURLS: string[];
  seller_id: string; // Assuming you want to pass only the seller ID in the DTO
  material?: string;
  dimensions?: string;
  interactions: { id: string }[]; // Assuming the DTO needs only the ID of the interactions
}
