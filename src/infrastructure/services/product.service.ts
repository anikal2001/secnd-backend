import { Product } from '../../core/entity/product.model';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductType } from '../../types/product';
import { getProducts, addProduct, deleteProduct } from '../shopify';
import { defaultSort } from '../shopify/constants';
import { second } from '../../api/decorators/middleware';
import { ProductColors, ProductTags } from '../../utils/products.enums';

export class ProductService {



  async fetchProducts(): Promise<unknown[]> {
    const { sortKey, reverse } = defaultSort;
    const products = await getProducts({ sortKey, reverse, query: '' });
    return products;
  }

  // async _genProductUpdateInput(product: any): ProductType {}

  async getProductById(id: string): Promise<Product | null> {
    return await ProductRepository.findOne({ where: { id } });
  }

  async createProduct(productData: ProductType): Promise<string> {
    const product = {
      name: 'Myself',
      description:
        'It operation true anyone time quite idea protect. Lot wonder threat position thousand audience letter. Answer old process treat quite trial.',
      price: 379.84,
      primaryColors: [ProductColors.Blue],
      secondaryColors: [ProductColors.Blue],
      size: "XS",
      category: 'Skirts',
      condition: 'Fair',
      tags: [ProductTags.Casual],
      brand: 'Sanders, Reid and Brown',
      material: ['Polyester'],
      gender: 'Unisex',
      seller: 'Morgan Garza',
      imageUrls: ['https://dummyimage.com/625x230', 'https://placekitten.com/559/775'],
    };
    const mutationInput = this._genProductAddInput(product);
    return await addProduct(mutationInput);
  }

  async updateProduct(id: string, productData: Product): Promise<Product | null> {
    const Product = await ProductRepository.findOne({ where: { id } });
    if (!Product) return null;

    Product.name = productData.name;
    Product.description = productData.description;
    Product.price = productData.price;

    await ProductRepository.insert(Product);
    return Product;
  }

  async deleteProduct(id: string): Promise<string> {
    const deletedID = await deleteProduct(id)
    return deletedID
  }

  // Private Methods
  _genProductUpdateInput(product: ProductType): any {
  }

  _genProductAddInput(product: ProductType): any {
    if (product.imageUrls && product.imageUrls.length === 0) {
      throw new Error('Product must have at least one image');
    }

    const colors = {
      PrimaryColor: product.primaryColors,
      SecondaryColor: product.secondaryColors,
    };

    const media = product.imageUrls.map((url) => {
      return {
        originalSource: url,
        alt: product.name,
        mediaContentType: 'IMAGE',
      };
    });

    const ProductAddSchema = {
      input: {
        title: product.name,
        descriptionHtml: product.description,
        category: 'gid://shopify/TaxonomyCategory/aa-1-1-7-5',
        tags: product.tags,
        vendor: product.seller,
        seo: {
          title: product.name,
          description: product.description,
        },
        productType: product.category,
        metafields: [
          {
            namespace: 'custom',
            key: 'condition',
            value: product.condition,
            type: 'single_line_text_field',
          },
          {
            namespace: 'custom',
            key: 'size',
            value: product.size,
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'material',
            value: product.material.toString(),
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'gender',
            value: product.gender,
            type: 'single_line_text_field',
          },
          {
            namespace: 'custom',
            key: 'brand',
            value: product.brand,
            type: 'single_line_text_field',
          },
          {
            namespace: 'custom',
            key: 'color',
            value: JSON.stringify(colors),
            type: 'json',
          },
        ],
      },
      media: media,
    };

    return ProductAddSchema;
  }
}
