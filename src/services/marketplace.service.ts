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
   * Delete a single marketplace listing by its ID.
   * @param listingId The marketplace listing ID as a string.
   */
  async deleteListing(listingId: string): Promise<void> {
    // Convert listingId to number since the primary key is a number.
    const id = Number(listingId);
    await this.marketplaceRepository.delete({ id });
  }

  async deleteListingByProductAndMarketplace(product_id: string, marketplace: string): Promise<void> {
    await this.marketplaceRepository
      .createQueryBuilder()
      .delete()
      .from(MarketplaceListing)
      .where("product_id = :product_id", { product_id })
      .andWhere("marketplace = :marketplace", { marketplace })
      .execute();
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
        // Use listing_id from your data instead of marketplace_id:
        marketplace_id: marketplaceData.listing_id,
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
    return listings.map((listing) => {
      if (listing.marketplace === 'depop') {
        return { id: listing.id, depop: { marketplace_id: listing.marketplace_id, slug: listing.slug } };
      }
      return { id: listing.id, [listing.marketplace]: { marketplace_id: listing.marketplace_id } };
    });
  }


  /**
   * Check if any marketplace listing exists for a product
   * @param product_id The product ID
   * @returns true if a listing exists, false otherwise
   */
  async doesAnyListingExist(product_id: string): Promise<boolean> {
    // This assumes your repository has a method findOne that accepts criteria.
    const listing = await this.marketplaceRepository.findOne({
      where: { product: { product_id } },
    });
    return listing !== null;
  }
}
