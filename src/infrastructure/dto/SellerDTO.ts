import { ProductDto } from "./ProductDTO";

export class SellerDTO {
  seller_id: number;
  email: string;
  store_name: string;
  store_description: string;
  store_logo: string;
  products: ProductDto[];
}