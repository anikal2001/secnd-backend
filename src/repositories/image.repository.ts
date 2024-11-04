import { AppDataSource } from '../database/config';
import Image from '../entity/image.entity';


export const ImageRepository = AppDataSource.getRepository(Image).extend({
    async createAndSave(imageData: Partial<Image>): Promise<Image | null> {
        const image = this.create(imageData);
        return this.save(image);
    },
    async findByProductId(productId: string): Promise<Image[]> {
        const images = await this.find({ where: { product_id: productId } });
        return images;
    },
    async deleteByProductId(productId: string): Promise<boolean> {
        const result = await this.delete({ product_id: productId });
        return result.affected === 1;
    },
    async deleteById(imageId: string): Promise<boolean> {
        const result = await this.delete({ image_id: imageId });
        return result.affected === 1;
    },
    async updateImage(imageId: string, imageData: Partial<Image>): Promise<Image | null> {
        const image = await this.findOne({ where: { image_id: imageId } });
        if (!image) {
            return null;
        }
        Object.assign(image, imageData);
        return this.save(image);
    },
});