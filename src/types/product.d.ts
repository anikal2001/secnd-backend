import { ProductColors, ProductTags } from '../utils/products.enums';

export type ProductType = {
    id: string;
    name: string;
    description: string;
    price: number;
    colors: ProductColors;
    size: string;
    category: string;
    condition: string;
    tags: ProductTags;
    brand: string;
    material: string;
    gender: string;
    seller: string;
    imageUrls: string[];
};