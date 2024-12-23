import 'dotenv/config';
import { AzureOpenAI } from 'openai';
import { z } from 'zod';
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index';
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

const endpoint = process.env['AZURE_OPENAI_ENDPOINT'] || '<endpoint>';
const apiKey = process.env['AZURE_OPENAI_API_KEY'] || '<api key>';

const apiVersion = '2024-08-01-preview';
const deploymentName = 'gpt-4o-mini';

function getClient(): AzureOpenAI {
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

const convertEnumToList = (enumObject: any): [string, ...string[]] => {
  const values = Object.values(enumObject) as string[];
  if (values.length === 0) {
    throw new Error("Enum object is empty");
  }
  return values as [string, ...string[]];
};

const promptText = `
Do not send any other text other than the json response.
Generate a JSON response for the following clothing attributes like title, description,
price, color, listed_size, product_category, styles, condition, brand, gender, and tags
based on the provided images and only use the following template for the response and only use the provided enums for the attributes.
If the image is not clear, please provide the best guess based on the image. Do not hallucinate.
Try to have the response as accurate as possible and do not give any null values:
- Product Category: ${convertEnumToList(ProductCategory).toString()}
- Product Colors: {primaryColors: [${convertEnumToList(ProductColors).toString()}], secondaryColors: [${convertEnumToList(ProductColors).toString()}]}
- Product Tags: ${convertEnumToList(ProductTags).toString()}
- Product Brand: ${convertEnumToList(ProductBrand).toString()}
- Product Condition: ${convertEnumToList(ProductCondition).toString()}
- Product Gender: ${convertEnumToList(ProductGender).toString()}
- Product Size: ${convertEnumToList(ProductSize).toString()}
- Product Styles: ${convertEnumToList(ProductStyles).toString()}
`;

function createMessages(imageUrl: string): ChatCompletionCreateParamsNonStreaming {
  return {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: promptText,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    model: "",
    max_tokens: 2000,
  };
}

// Define the Zod schema for the expected JSON response
const responseSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  color: z.object({
    primaryColors: z.array(z.enum(convertEnumToList(ProductColors))),
    secondaryColors: z.array(z.enum(convertEnumToList(ProductColors))),
  }),
  listed_size: z.enum(convertEnumToList(ProductSize)),
  product_category: z.enum(convertEnumToList(ProductCategory)),
  styles: z.array(z.enum(convertEnumToList(ProductStyles))),
  condition: z.enum(convertEnumToList(ProductCondition)),
  brand: z.enum(convertEnumToList(ProductBrand)),
  gender: z.enum(convertEnumToList(ProductGender)),
  tags: z.array(z.enum(convertEnumToList(ProductTags))),
});

async function validateAndGenerate(client: AzureOpenAI, messages: ChatCompletionCreateParamsNonStreaming): Promise<any> {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const completion = await client.chat.completions.create(messages);
    for (const choice of completion.choices) {
      try {
        // Validate the response
        if (choice.message.content) {
          const parsedResponse = responseSchema.parse(JSON.parse(choice.message.content));
          return parsedResponse; // Return the valid response
        } else {
          console.error("Empty response received, regenerating response.");
        }
      } catch (error) {
        console.error("Validation failed, regenerating response:", (error as Error).message);
      }
    }
    attempts++;
  }

  throw new Error("Failed to generate a valid response after multiple attempts.");
}

export async function main(imageUrl: string): Promise<any> {
  console.log("== Get GPT-4 Turbo with vision Sample ==");

  const client = getClient();
  const messages = createMessages(imageUrl);

  try {
    const validResponse = await validateAndGenerate(client, messages);
    console.log("Valid response received:", validResponse);
    return validResponse;
  } catch (error) {
    console.error("Error generating valid response:", (error as Error).message);
    throw error;
  }
}

export default main;
