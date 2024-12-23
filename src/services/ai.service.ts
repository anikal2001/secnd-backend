import 'dotenv/config';
import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import {
  ProductCategory,
  ProductColors,
  ProductTags,
  ProductBrand,
  ProductCondition,
  ProductGender,
  ProductSize,
  ProductStyles,
  ProductMaterial,
} from '../utils/products.enums';

// Zod schema for product response
const ProductColorsSchema = z.object({
  primaryColors: z.array(z.enum(Object.values(ProductColors) as [string, ...string[]])),
  secondaryColors: z.array(z.enum(Object.values(ProductColors) as [string, ...string[]]))
});

const ProductResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  color: ProductColorsSchema,
  listed_size: z.enum(Object.values(ProductSize) as [string, ...string[]]).nullable(),
  product_category: z.enum(Object.values(ProductCategory) as [string, ...string[]]).nullable(),
  styles: z.array(z.enum(Object.values(ProductStyles) as [string, ...string[]])),
  condition: z.enum(Object.values(ProductCondition) as [string, ...string[]]).nullable(),
  brand: z.enum(Object.values(ProductBrand) as [string, ...string[]]).nullable(),
  gender: z.enum(Object.values(ProductGender) as [string, ...string[]]).nullable(),
  tags: z.array(z.enum(Object.values(ProductTags) as [string, ...string[]]))
});

type ProductResponse = z.infer<typeof ProductResponseSchema>;

const convertEnumToList = (enumObject: any): string[] => {
  return Object.values(enumObject);
};

const createPrompt = (imageURL: string) => `
Please analyze the image at the following URL and provide a JSON response for the clothing attributes: ${imageURL}.
Do not send any other text other than the json response.
Generate a JSON response for the following clothing attributes like title, description,
price, color, listed_size, product_category, styles, condition, brand, gender, and tags
based on the provided images and only use the following template for the response and only use the provided enums for the attributes.
If the image is not clear, please provide the best guess based on the image. Do not hallucinate.
Give as much information as possible. If a guess absolutely cannot be made, please provide a null value except for price, title and description.
Try to have the response as accurate as possible and avoid null values as much as possible and make sure price is not a string.:
- Product Category: ${convertEnumToList(ProductCategory).toString()}
- Product Colors: {primaryColors: [${convertEnumToList(ProductColors).toString()}], secondaryColors: [${convertEnumToList(ProductColors).toString()}]}
- Product Tags: ${convertEnumToList(ProductTags).toString()}
- Product Brand: ${convertEnumToList(ProductBrand).toString()}
- Product Condition: ${convertEnumToList(ProductCondition).toString()}
- Product Gender: ${convertEnumToList(ProductGender).toString()}
- Product Size: ${convertEnumToList(ProductSize).toString()}
- Product Styles: ${convertEnumToList(ProductStyles).toString()}
`;

class ProductClassifier {
  private model: AzureChatOpenAI;

  constructor() {
    this.model = new AzureChatOpenAI({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: "2024-08-01-preview",
      azureOpenAIApiDeploymentName: "gpt-4o",
      azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
      maxTokens: 5000,
    });
  }

  async classifyProduct(imageUrl: string): Promise<ProductResponse> {
    try {
      const prompt = createPrompt(imageUrl).toString();
      const messages = [
        new SystemMessage("You are a helpful assistant that generates JSON data."),
        new HumanMessage(prompt),
      ];

      const response = await this.model.call(messages);
      if (!response) {
        throw new Error("No text content found in the response");
      }
      const parsedContent = JSON.parse((response.content as string).replace(/```json\n|```/g, "").trim());
      
      const validatedResponse = ProductResponseSchema.parse(parsedContent);
      return validatedResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        throw new Error("Invalid response format from AI model");
      }
      throw error;
    }
  }
}

export async function main(imageUrl: string): Promise<ProductResponse> {
  console.log("== Get GPT-4 Turbo with vision Sample ==");
  
  const classifier = new ProductClassifier();

  const result = await classifier.classifyProduct(imageUrl);
  
  console.log("== End of GPT-4 Turbo with vision Sample ==");
  return result;
}

export default main;