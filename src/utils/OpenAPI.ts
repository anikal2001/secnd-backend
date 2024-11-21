import 'dotenv/config';
import { AzureOpenAI } from 'openai';
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

const convertEnumToList = (enumObject: any): string[] => {
  return Object.values(enumObject);
};

const promptText = `
Do not send any other text other than the json response.
Generate a JSON response for the following clothing attributes like title, description,
price, color, listed_size, product_category, styles, condition, brand, gender, and tags
based on the provided images and only use the following template for the response and only use the provided enums for the attributes.
If the image is not clear, please provide the best guess based on the image. Do not hallucinate.
 If a guess is not possible, please provide a null value except for price.
Try to have the response as accurate as possible and avoid null values as much as possible.:
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
      { role: 'system', content: 'You are a helpful assistant.' },
      {
        role: 'user',
        content: `Here is some text followed by an image: ${imageUrl}`,
      },
    ],
    model: 'gpt-4-turbo', // Make sure to specify your model here
    max_tokens: 2000,
  };
}

async function printChoices(completion: ChatCompletion): Promise<void> {
  for (const choice of completion.choices) {
    console.log(choice.message);
  }
}

export async function main(imageUrl: string): Promise<any> {
  console.log('== Get GPT-4 Turbo with vision Sample ==');
  console.log(imageUrl)

  const client = getClient();
  const messages = createMessages(imageUrl);
  const completion = await client.chat.completions.create(messages);
  for (const choice of completion.choices) {
    console.log(choice.message);
    return choice.message.content;
  }
  console.log('== End of GPT-4 Turbo with vision Sample ==');
}

export default main;
