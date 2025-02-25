import { AppDataSource } from '../database/config';
import { MarketplaceListing } from '../entity/marketplace.entity';

export const MarketplaceRepository = AppDataSource.getRepository(MarketplaceListing).extend({
  async findByProductId(productId: string): Promise<MarketplaceListing[]> {
    return await this.find({
      where: {
        product: { product_id: productId }
      }
    });
  },
  
  async deleteByProductId(productId: string): Promise<void> {
    // First find all marketplace listings for this product
    const listings = await this.findByProductId(productId);
    
    if (listings.length > 0) {
      // Delete them all
      await this.remove(listings);
    }
  }
});
