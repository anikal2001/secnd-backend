import { MarketplaceListing } from '../entity/marketplace.entity';
import { MarketplaceRepository } from '../repositories/marketplace.repository';
import { Product } from '../entity/product.entity';

interface CreateMarketplaceListingDTO {
  product_id: string;
  marketplace_id: string;
  marketplace: string;
  name: string;
  slug?: string;
}

export class MarketplaceService {
  private marketplaceRepository = MarketplaceRepository;

  /**
   * Find marketplace listings for a product
   * @param productId The product ID
   * @returns Array of marketplace listings
   */
  async findByProductId(productId: string): Promise<MarketplaceListing[]> {
    return await this.marketplaceRepository.findByProductId(productId);
  }

  /**
   * Delete all marketplace listings for a product
   * @param productId The product ID
   */
  async deleteByProductId(productId: string): Promise<void> {
    await this.marketplaceRepository.deleteByProductId(productId);
  }

  /**
   * Create a marketplace listing
   * @param data The marketplace listing data
   * @returns The created marketplace listing
   */
  async create(data: CreateMarketplaceListingDTO): Promise<MarketplaceListing> {
    const marketplaceListing = new MarketplaceListing();

    // Set the product reference
    marketplaceListing.product = { product_id: data.product_id } as Product;
    marketplaceListing.marketplace_id = data.marketplace_id;
    marketplaceListing.marketplace = data.marketplace;

    // Only add slug for depop
    if (data.name === 'depop' && data.slug) {
      marketplaceListing.slug = data.slug;
    }

    return await this.marketplaceRepository.save(marketplaceListing);
  }

  /**
   * Process marketplace data for a product
   * @param product The product object
   * @param marketplaces Array of marketplace data
   * @returns Array of marketplace names
   */
  async processMarketplaces(product: any, marketplaces: any[]): Promise<string[]> {
    if (!marketplaces || !Array.isArray(marketplaces) || marketplaces.length === 0) {
      console.log('No marketplace data provided for product:', product.product_id);
      return [];
    }

    // Extract marketplace names for the product.marketplaces array
    const marketplaceNames: string[] = [];

    // Create marketplace listings
    const marketplacePromises = marketplaces.map(async (marketplaceItem: any) => {
      // Each item should be in format: { name: { marketplace_id: string, slug?: string } }
      const marketplaceName = Object.keys(marketplaceItem)[0];
      const marketplaceData = marketplaceItem[marketplaceName];

      console.log(`Processing marketplace for product ${product.product_id}:`, marketplaceName, marketplaceData);

      // Add to the list of marketplace names
      marketplaceNames.push(marketplaceName);

      // Create the marketplace listing
      await this.create({
        product_id: product.product_id,
        marketplace: marketplaceName,
        marketplace_id: marketplaceData.marketplace_id,
        name: marketplaceName,
        slug: marketplaceData.slug,
      });
    });

    await Promise.all(marketplacePromises);

    return marketplaceNames;
  }

  /**
   * Update marketplace listings for a product
   * @param product The product object
   * @param marketplaces Array of marketplace data
   * @returns Array of marketplace names
   */
  async updateMarketplaces(product: any, marketplaces: any[]): Promise<string[]> {
    // First, delete existing marketplace listings for this product
    await this.deleteByProductId(product.product_id);

    // Then process the new marketplace data
    return await this.processMarketplaces(product, marketplaces);
  }

  /**
   * Formats an array of MarketplaceListing entities into the desired structure.
   * For example:
   *   [{ etsy: { marketplace_id: 'etsy' } }, { depop: { marketplace_id: 'depop', slug: 'some-slug' } }]
   * @param listings Array of MarketplaceListing entities
   */
  public static formatListings(listings: MarketplaceListing[]): any[] {
    return listings.map(listing => {
      if (listing.marketplace === 'depop') {
        return { id: listing.id, depop: { marketplace_id: listing.marketplace_id, slug: listing.slug } };
      }
      return { id: listing.id, [listing.marketplace]: { marketplace_id: listing.marketplace_id } };
    });
  }
}
