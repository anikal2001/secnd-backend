import { AppDataSource } from '../database/config';
import { Measurement } from '../entity/measurement.entity';
import { Product } from '../entity/product.entity';

export const MeasurementRepository = AppDataSource.getRepository(Measurement).extend({
  /**
   * Find measurements by product ID
   */
  async findByProductId(productId: string): Promise<Measurement[]> {
    return this.find({
      where: { product: { product_id: productId } },
      relations: ['product'],
    });
  },

  async deleteMeasurement(measurementId: string): Promise<void> {
    const res = await this.delete({ measurement_id: measurementId });
    console.log('Delete result:', res);
  },
  /**
   * Find measurements by product ID and types
   * This avoids the UUID error by querying the type field, not the id field
   */
  // async findByProductIdAndTypes(productId: string, types: string[]): Promise<Measurement[]> {
  //     return this.find({
  //         where: {
  //             product: { product_id: productId },
  //             id: types
  //         },
  //         relations: ['product']
  //     });
  // },

  /**
   * Create or update measurements for a product
   * This method handles the conversion between input format and database structure
   */
  async saveForProduct(
    productId: string,
    measurements: Array<{
      id: string; // measurement type e.g. 'chest'
      label: string;
      custom: string;
      value: number;
      unit: string;
    }>,
  ): Promise<Measurement[]> {
    // First get the product repository
    const productRepository = AppDataSource.getRepository(Product);
    // Find the product
      const product = await productRepository.findOneBy({ product_id: productId });
      console.log('Product:', product);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Create measurement entities
    const entities = measurements.map((measurement) => {
      const entity = new Measurement();
      // Do NOT assign an ID - it will be auto-generated
      entity.id = measurement.id; // Store the measurement type
      entity.label = measurement.label;
      entity.custom = measurement.custom || '';
      entity.value = measurement.value;
      entity.unit = measurement.unit;
      entity.product = product; // Link to the product
      return entity;
    });

    // Save the entities
    return this.save(entities);
  },

  /**
   * Delete measurements for a product
   */
  async deleteByProductId(productId: string): Promise<void> {
    const measurements = await this.findByProductId(productId);
    if (measurements.length > 0) {
      await Promise.all(measurements.map((measurement) => this.deleteMeasurement(measurement.measurement_id)));
    }
  },

  /**
   * Update measurements for a product
   * Removes existing measurements and creates new ones
   */
  async updateForProduct(
    productId: string,
    measurements: Array<{
      id: string;
      label: string;
      custom: string;
      value: number;
      unit: string;
    }>,
  ): Promise<Measurement[]> {
    // First delete existing measurements
    await this.delete({ product: { product_id: productId } });

    // Then create new ones
    return this.saveForProduct(productId, measurements);
  },
});
