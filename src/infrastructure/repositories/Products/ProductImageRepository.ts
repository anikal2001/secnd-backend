import { Column, Entity } from "typeorm"; 
import AppDataSource from "../../db/database";
import { ProductImage } from "../../../core/entity/product_image.model";

export const ProductImageRepository = AppDataSource.getRepository(ProductImage).extend({
    async getProductImages(productId: string): Promise<ProductImage[]> {
        const productImages = this.find({ where: { product_id: productId } });
        return productImages;
    },
});
