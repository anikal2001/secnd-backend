export interface ProductSearchParams {
  query?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ProductVariantParams {
  size?: string;
  product_type?: string;
  primary_color?: string[];
  secondary_color?: string[];
}

export interface ProductResponse {
  items: any[];
  total: number;
  limit: number;
  offset: number;
}

export interface VectorProduct {
  id: string;
  name: string;
  description: string;
  product_type: string;
  primary_color?: string;
  secondary_color?: string;
  size?: string;
  embedding?: number[];
}

export class VectorService {
  private readonly baseUrl: string;

  constructor() {
    if (!process.env.VECTOR_SERVICE_URL) {
      throw new Error('PRODUCT_SERVICE_URL environment variable is not set');
    }
    this.baseUrl = process.env.VECTOR_SERVICE_URL;
  }

  /**
   * Search for products using the product service API
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductResponse> {
    const queryParams = new URLSearchParams({
      ...(params.query && { query: params.query }),
      ...(params.category && { category: params.category }),
      ...(params.status && { status: params.status }),
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString()
    });

    const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Product search failed: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get product variants from the product service API
   */
  async getProductVariants(productId: string, params?: ProductVariantParams) {
    const queryParams = new URLSearchParams({
      ...(params?.size && { size: params.size }),
      ...(params?.product_type && { product_type: params.product_type }),
      ...(params?.primary_color?.length && { primary_color: params.primary_color.join(',') }),
      ...(params?.secondary_color?.length && { secondary_color: params.secondary_color.join(',') })
    });

    const response = await fetch(`${this.baseUrl}/variants/${productId}?${queryParams}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get product variants: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Combine vector search with product service results
   * This method can be extended based on your vector database implementation
   */
  async vectorSearch(embeddings: number[], params: ProductSearchParams) {
    // TODO: Implement vector database search here
    // This is where you'd query your vector database using the embeddings
    
    // After getting vector results, fetch additional product details
    const productResults = await this.searchProducts(params);
    
    return {
      ...productResults,
      vectorScores: [] // Add vector similarity scores here
    };
  }

  /**
   * Add a single product to the vector database
   */
  async addProduct(product: VectorProduct) {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add product to vector database: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Batch add products to the vector database
   */
  async batchAddProducts(products: VectorProduct[]) {
    const response = await fetch(`${this.baseUrl}/products/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to batch add products to vector database: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a product from the vector database
   */
  async deleteProduct(productId: string) {
    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete product from vector database: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

}