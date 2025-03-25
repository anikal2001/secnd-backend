import { plainToClass, plainToInstance } from 'class-transformer';
import { AppDataSource } from '../database/config';
import { Measurement } from '../entity/measurement.entity';
import { ProductRepository } from '../repositories/product.repository';
import { MeasurementRepository } from '../repositories/measurement.repository';

// Define interface matching your input format
interface MeasurementInput {
  id: string;       // 'chest', 'shoulderWidth', etc.
  label: string;
  custom: string;
  value: number;
  unit: string;
}

export class MeasurementService {
  private MeasurementRepository = MeasurementRepository;

  // Create measurements for a product
  async createMeasurementsForProduct(
    productId: string, 
    measurements: MeasurementInput[]
  ): Promise<Measurement[]> {
    try {
      const product = await ProductRepository.findOneBy({ product_id: productId });
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Create new measurement entities
      const measurementEntities: Measurement[] = [];
      
      for (const measurement of measurements) {
        const entity = new Measurement();
        // Don't set the ID - it will be auto-generated
        entity.id = measurement.id;          // Store type from input.id
        entity.label = measurement.label;
        entity.custom = measurement.custom || "";
        entity.value = measurement.value;
        entity.unit = measurement.unit || "cm"; // Provide default unit when not specified
        entity.product = product;              // Set the relationship
        
        measurementEntities.push(entity);
        }
        console.log(measurementEntities)

      // Save the measurements
      return await this.MeasurementRepository.saveForProduct(productId, measurementEntities);
    } catch (error) {
      console.error('Error creating measurements:', error);
      throw error;
    }
  }

  // Get measurements for a product
  async getMeasurementsByProductId(productId: string): Promise<Measurement[]> {
    return await this.MeasurementRepository.find({
      where: { product: { product_id: productId } },
      relations: ['product']
    });
  }

  // Update measurements for a product
  async updateMeasurementsForProduct(productId: string, measurements: MeasurementInput[]): Promise<Measurement[]> {
    try {
      // First delete existing measurements
      await this.MeasurementRepository.delete({ product: { product_id: productId } });
      
      // Then create new ones
      return await this.createMeasurementsForProduct(productId, measurements);
    } catch (error) {
      console.error('Error updating measurements:', error);
      throw error;
    }
  }
}
