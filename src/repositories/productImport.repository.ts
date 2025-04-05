import { AppDataSource } from '../database/config';
import { ProductImport } from '../entity/product.entity';

export const ProductImportRepository = AppDataSource.getRepository(ProductImport).extend({
    createAndSave(product: any) { 
    return this.createQueryBuilder('productimport')
      .insert()
      .into(ProductImport)
      .values(product)
      .execute();
  },
});
