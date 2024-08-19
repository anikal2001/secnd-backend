import { Product } from '../../core/entity/product.model';
import { ProductRepository } from '../repositories/Products/ProductRepository';
import { ProductType } from '../../types/product';
import { getProducts, addProduct, deleteProduct } from '../shopify';
import { defaultSort } from '../shopify/constants';
import { second } from '../../api/decorators/middleware';
import bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { ProductColors, ProductTags } from '../../utils/products.enums';
import { SellerRepository } from '../repositories/sellerRepository';
import { CreateProductDto } from '../dto/CreateProductDTO';

export class ProductService {
  async getProductById(id: string): Promise<string> {
    return 'Product';
    // return await ProductRepository.findOne({ where: { id } });
  }

  async fetchProducts(): Promise<Product[]> {
    return await ProductRepository.find();
  }

  async updateProduct(id: string, productData: Product): Promise<Product | null> {
    const Product = false;
    if (!Product) return null;

    // Product.name = productData.name;
    // Product.description = productData.description;
    // Product.price = productData.price;

    // await ProductRepository.insert(Product);
    return Product;
  }

  // async createProduct(createProductDto: CreateProductDto): Promise<Product> {
  //     // You can perform additional validations or transformations here
  //     const productData: Partial<Product> = {
  //           name: createProductDto.name,
  //           description: createProductDto.description,
  //           price: createProductDto.price,
  //           listed_size: createProductDto.listed_size,
  //           brand: createProductDto.brand,
  //           gender: createProductDto.gender,
  //           primaryColor: createProductDto.primaryColor,
  //           secondaryColor: createProductDto.secondaryColor,
  //           seller: createProductDto.seller,
  //           tags: createProductDto.tags,
  //           attributes: createProductDto.attributes,
  //           items: createProductDto.items,
  //       };

  //       return await ProductRepository.createAndSave(productData);
  // }
  async deleteProduct(id: string): Promise<string> {
    const deletedID = await deleteProduct(id);
    return deletedID;
  }

  async _genProductId(sellerId: string, productName: string): Promise<string> {
    return await bcrypt.hashSync(sellerId + productName.toLowerCase(), 10);
  }

  // async fetchProducts( ): Promise<unknown[]> {
  //   const { sortKey, reverse } = defaultSort;
  //   const products = await getProducts({ sortKey, reverse, query: '' });
  //   return products;
  // }

  async createProduct(productData: ProductType): Promise<Product> {
    const product = {
      name: 'Myself',
      description:
        'It operation true anyone time quite idea protect. Lot wonder threat position thousand audience letter. Answer old process treat quite trial.',
      price: 379.84,
      color: {
        primaryColor: [ProductColors.Blue],
        secondaryColor: [ProductColors.Blue],
      },
      listed_size: "XS",
      product_category: 'Skirts',
      condition: 'Fair',
      tags: [ProductTags.Casual],
      brand: 'Sanders, Reid and Brown',
      material: ['Polyester'],
      gender: 'Unisex',
      seller: 1,
      imageUrls: ['https://dummyimage.com/625x230', 'https://placekitten.com/559/775'],
    };
    const newProduct = plainToClass(Product, product);
    return await ProductRepository.createAndSave(newProduct);
  }

  // // Private Methods
  // _genProductUpdateInput(product: ProductType): any {
  // }

  // _genProductAddInput(product: ProductType): any {
  //   if (product.imageUrls && product.imageUrls.length === 0) {
  //     throw new Error('Product must have at least one image');
  //   }

  //   const colors = {
  //     PrimaryColor: product.primaryColors,
  //     SecondaryColor: product.secondaryColors,
  //   };

  //   const media = product.imageUrls.map((url) => {
  //     return {
  //       originalSource: url,
  //       alt: product.name,
  //       mediaContentType: 'IMAGE',
  //     };
  //   });

  //   const ProductAddSchema = {
  //     input: {
  //       title: product.name,
  //       descriptionHtml: product.description,
  //       category: 'gid://shopify/TaxonomyCategory/aa-1-1-7-5',
  //       tags: product.tags,
  //       vendor: product.seller,
  //       seo: {
  //         title: product.name,
  //         description: product.description,
  //       },
  //       productType: product.category,
  //       metafields: [
  //         {
  //           namespace: 'custom',
  //           key: 'condition',
  //           value: product.condition,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'size',
  //           value: product.size,
  //           type: 'single_line_text_field'
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'material',
  //           value: product.material.toString(),
  //           type: 'single_line_text_field'
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'gender',
  //           value: product.gender,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'brand',
  //           value: product.brand,
  //           type: 'single_line_text_field',
  //         },
  //         {
  //           namespace: 'custom',
  //           key: 'color',
  //           value: JSON.stringify(colors),
  //           type: 'json',
  //         },
  //       ],
  //     },
  //     media: media,
  //   };

  //   return ProductAddSchema;
  // }
}
