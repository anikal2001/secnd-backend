import 'dotenv/config';
import { AzureOpenAI } from 'openai';
import { z } from 'zod';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index';
import {
  ProductColors,
  ProductTags,
  ProductBrand,
  ProductCondition,
  ProductSize,
  ProductStyles,
} from '../utils/products.enums';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

function getClient(): AzureOpenAI {
  return new AzureOpenAI({
    endpoint,
    deployment,
    apiKey,
  });
}

const convertEnumToList = (enumObject: any): [string, ...string[]] => {
  const values = Object.values(enumObject) as string[];
  if (values.length === 0) {
    throw new Error("Enum object is empty");
  }
  return values as [string, ...string[]];
};

function createMessages(imageUrls: string[]): ChatCompletionCreateParamsNonStreaming {
  return {
    messages: [
      {
        "role": "system",
        "content": "You are a helpful assistant with advanced vision capabilities. You can see and interpret multiple images, then answer questions or provide descriptions about them. Carefully follow the user's instructions, provide a reasoned approach to analyzing each image, and ensure the final output is factual and consistent."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "You will be given three images. Please analyze them *collectively* as if they are of the same item from different angles (or in different details). Then complete the following steps **in your own chain-of-thought** (you do not need to reveal the chain-of-thought to the user). You must return a final **JSON** object containing the fields listed below. Do not add extraneous fields."
          },
          {
            "type": "text",
            "text": "## Fields to return\n1. title\n2. description\n3. brand\n4. condition (possible values: new, like new, good, fair)\n5. gender (either menswear or womenswear)\n6. colors (choose from: black, grey, white, brown, tan, cream, yellow, red, burgundy, orange, pink, purple, blue, navy, green, khaki, multi)\n7. size (choose from: XXS, XS, S, M, L, XL, 2XL, 3XL, OS)\n8. material (choose from: cotton, polyester, wool, silk, linen, nylon, rayon, spandex)\n9. tags (array of any descriptive keywords you believe are relevant)\n10. predicted_list_price (a numeric value in USD, e.g. 59.99)\n\n"
          },
          {
            "type": "text",
            "text": "## Title structure\nUse this format strictly:\n[Style] [Age/era] [Color] [Material] [Category] [Detail]\nExample: \"Vintage 1980s fuchsia pink angora knit sweater dress with velvet, satin and bead detail\""
          },
          {
            "type": "text",
            "text": "## Process to follow\n1. Determine gender (menswear or womenswear).\n2. Determine the major category (tops, bottoms, outerwear, dresses) using visual clues.\n3. Determine the subcategory from:\n   - **Menswear** subcategories:\n     - mens_tops: Long Sleeve T-Shirts, Polos, Shirts (Button Ups), Short Sleeve T-Shirts, Sweaters & Knitwear, Sweatshirts & Hoodies, Tank Tops & Sleeveless, Jerseys\n     - mens_bottoms: Casual Pants, Cropped Pants, Denim, Leggings, Overalls & Jumpsuits, Shorts, Sweatpants & Joggers\n     - mens_outerwear: Bomber, Cloaks & Capes, Denim Jackets, Heavy Coats, Leather Jackets, Light Jackets, Parkas, Raincoats, Vests\n   - **Womenswear** subcategories:\n     - womens_tops: Blouses, Bodysuits, Button Ups, Crop Tops, Hoodies, Long Sleeve T-Shirts, Polos, Short Sleeve T-Shirts, Sweaters, Sweatshirts, Tank Tops\n     - womens_bottoms: Jeans, Joggers, Jumpsuits, Leggings, Maxi Skirts, Midi Skirts, Mini Skirts, Pants, Shorts, Sweatpants\n     - womens_outerwear: Blazers, Coats, Denim Jackets, Down Jackets, Fur & Faux Fur, Jackets, Leather Jackets, Rain Jackets, Vests\n     - womens_dresses: Mini Dresses, Midi Dresses, Maxi Dresses, Gowns\n4. Identify primary color(s).\n5. Determine overall condition.\n6. Identify brand (if visible or known, otherwise guess or leave blank).\n7. Provide a description of the item.\n8. Construct the **title** using the format `[Style] [Age] [Color] [Material] [Category] [Detail]`.\n9. Predict a reasonable listing price in USD.\n\n"
          },
          {
            "type": "text",
            "text": "## Additional instructions\n- Provide a short chain-of-thought reasoning *internally* to ensure correctness, but *only include the final JSON* as your response.\n- If certain fields are unclear or you are not sure, make a best guess based on the images.\n- Aim for consistency and do not hallucinate beyond what's visible. If brand cannot be definitively identified, simply state \"unknown\".\n"
          },
          {
            "type": "text",
            "text": "Now, let's begin. Here are the three images (in either base64 or URL form)."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrls[0]
            }
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrls[1]
            }
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrls[2]
            }
          },
          {
            "type": "text",
            "text": "Please analyze these images carefully following the steps above and return the final JSON with the fields: title, description, brand, condition, gender, colors, size, material, tags, predicted_list_price."
          }
        ]
      }
    ],
    model: "gpt-4o-mini",
    max_tokens: 2000,
  };
}

const responseSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  color: z.object({
    primaryColors: z.array(z.enum(convertEnumToList(ProductColors))),
    secondaryColors: z.array(z.enum(convertEnumToList(ProductColors))),
  }),
  listed_size: z.enum(convertEnumToList(ProductSize)),
  category: z.enum(convertEnumToList(Category)),
  subcategory: z.enum(convertEnumToList(Subcategory)),
  styles: z.array(z.enum(convertEnumToList(ProductStyles))),
  condition: z.enum(convertEnumToList(ProductCondition)),
  brand: z.enum(convertEnumToList(ProductBrand)),
  gender: z.enum(convertEnumToList(Gender)),
  tags: z.array(z.enum(convertEnumToList(ProductTags))),
});

async function validateAndGenerate(client: AzureOpenAI, messages: ChatCompletionCreateParamsNonStreaming): Promise<any> {
  const maxAttempts = 3;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    try {
      const completion = await client.chat.completions.create(messages);

      if (!completion.choices || completion.choices.length === 0) {
        console.error("No choices received, retrying...");
        continue;
      }

      for (const choice of completion.choices) {
        const content = choice.message?.content;

        if (!content) {
          console.error("Empty content in choice, retrying...");
          continue;
        }

        try {
          const parsedResponse = responseSchema.parse(JSON.parse(content));
          return parsedResponse;
        } catch (validationError) {
          console.error("Validation failed:", (validationError as Error).message);
        }
      }
    } catch (error) {
      console.error("Error during API call:", (error as Error).message);
    }

    console.log(`Retrying (${attempts + 1}/${maxAttempts})...`);
  }

  throw new Error("Failed to generate a valid response after multiple attempts.");
}

export async function main(imageUrls: string[]): Promise<any> {
  console.log("== Get GPT-4 Turbo with vision Sample ==");

  const client = getClient();
  const messages = createMessages(imageUrls);

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
