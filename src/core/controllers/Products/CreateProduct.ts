import { Product } from '../../entity/product.model';

interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

class CreateProduct {
  private productRepository;

  // TODO: Update type according to typeorm
  constructor(productRepository: any) {
    this.productRepository = productRepository;
  }

  async execute(createProductRequest: CreateProductRequest): Promise<Product> {
    const newProduct = this.productRepository.create(createProductRequest);

    await this.productRepository.save(newProduct);
    return newProduct;
  }
}

export default CreateProduct;
