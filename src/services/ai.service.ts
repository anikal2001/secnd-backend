import 'dotenv/config';
import { z } from 'zod';
import OpenAI from 'openai';
import { Gender, ProductColors, ProductCondition, Material } from '../utils/products.enums';
import { Category, categoryHierarchy } from '../utils/product/category';

const ProductSizes = ['xxs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl', 'os'];

const ProductResponseSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    color: z.object({
      primaryColor: z.array(z.enum(Object.values(ProductColors) as [string, ...string[]])),
      secondaryColor: z.array(z.enum(Object.values(ProductColors) as [string, ...string[]])).nullable(),
    }),
    listed_size: z.string().nullable(),
    gender: z.enum([Gender.Menswear, Gender.Womenswear]),
    category: z.enum(Object.values(Category.getAllTopLevelCategories()) as [string, ...string[]]),
    subcategory: z.enum(Object.values(Category.getAllSubcategories()) as [string, ...string[]]).optional(),
    material: z.string().nullable(),
    condition: z.string(),
    brand: z.string().nullable(),
    tags: z.array(z.string()),
  })
  .refine((data) => !data.subcategory || Category.validate(data.gender, data.category, data.subcategory), {
    message: 'Invalid category/subcategory combination for gender.',
    path: ['product_subcategory'],
  });

type ProductResponse = z.infer<typeof ProductResponseSchema>;

function createThreeImageMessages(imageUrls: string[]): OpenAI.Chat.ChatCompletionMessageParam[] {
  const ProductColorsList = Object.values(ProductColors).join(', ');
  const ProductMaterialsList = Object.values(Material).join(', ');
  const ProductSizesList = ProductSizes.join(', ');
  const ProductConditionsList = Object.values(ProductCondition).join(', ');
  const CategoryHierarchy = Category.formatCategoryHierarchy();

  return [
    {
      role: 'system',
      content: 'You are an advanced clothing analysis assistant. Analyze images step-by-step',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
Analyze the clothing item from the following images and provide JSON with detailed attributes.

### Task Instructions:
1. **Images to analyze:**
   - Front: ${imageUrls[0]}
   - Back: ${imageUrls[1]}
   - Detail: ${imageUrls[2]}

2. **Determine the following in order:**
   - **Gender**: "Menswear" or "Womenswear". Default to "Menswear" for unisex items.
   - **Category and Subcategory**: Choose from the following hierarchy:
${CategoryHierarchy}
 
3. **Provide JSON with the following attributes:**
    - **Title**: Write the title in the format:
    
     \`Vintage [age/decade] [brand or identifiable text] / [subcategory] / [fit type or design] / [style descriptor 1] [/ [style descriptor 2]]\`
     - Example 1: "Vintage 1990s Martinique carribean / Vacation Crewneck Sweatshirt"
     - Example 2: "Vintage 2000s Plaid Button Up / Colourful / Flannel / Shirt"
     - Example 3: "Vintage 1990s Levi Strauss 501 Red Tab Button Fly Denim Jeans / Made in USA / American Vintage / Workwear / Streetwear"
     - Use "style" to describe the overall look or aesthetic (e.g., "vintage", "modern", "retro").
     - Use "age" if any era or decade can be inferred (e.g., "1980s").
     - Use "color" for the dominant color(s) (from: ${ProductColorsList}).
     - Use "material" for the primary material (from: ${ProductMaterialsList}).
     - Use "subcategory" for the item type (from hierarchy above).
     - Use "design" for any notable patterns, decorations, or details.
     - Use "fit type" for the clothing fit (e.g., "slim", "regular", "loose", "relaxed").
     - Use size i.e. 36x32 for description, but use only included options in the next Size output. 
   - **Description**: In the following format:
      This @brand @age in @color is size @size.
      [Detailed description including notable features]

   - **Price**: Estimated price as a number (e.g., 25.99), take the condition, brand and trend into account.
   - **Colors**:
     - Pick the colors from the list: ${ProductColorsList}. If color is not present, map to the closest color within the provided list (i.e. turquoise should be mapped to blue)
     - Primary colors: Dominant colors
     - Secondary colors: Accent colors
   - **Material**: Material composition (e.g., ${ProductMaterialsList}).
   - **Size**: Listed size from the options: ${ProductSizesList}. DO NOT GIVE SIZES NOT INCLUDED IN THE OPTIONS. DO NOT GIVE 36x32, JUST GIVE THE WAIST IF POSSIBLE.
   - **Category**: The determined category (e.g., "Tops", "Bottoms").
   - **Subcategory**: The determined subcategory (e.g., "T-Shirts", "Jeans").
   - **Condition**: Condition of the item from the options: ${ProductConditionsList}.
   - **Brand**: Brand name, if visible.
   - **Gender**: The determined gender.
   - **Tags**: Relevant tags (e.g., "casual", "vintage").

***Before providing your final answer, carefully analyze each image for***:
- Logos and text placement
- Fabric texture and patterns
- Stitching quality and patterns
- Hardware elements (buttons, zippers, etc.)
- Distinctive details that indicate era or brand

### Expectations:
- Always guess the gender, category, and subcategory, even if uncertain.
- Provide as much detail as possible.
- Make sure decade is present at the beginning of the title
- Use **null** for attributes that cannot be determined, except "title", "description", "price", and "condition".

Common mistakes to avoid:
- Confusing similar materials (e.g., cotton blend vs 100% cotton)
- Misidentifying decades (note: Y2K items are 1999-2004)
- Inaccurate pricing (vintage band t-shirts command higher prices)

### Example Output:
\`\`\`json
{
  "title": "Vintage 1990s Martinique carribean / Vacation Crewneck Sweatshirt",
  "description": "A sleek modern polo shirt in navy blue cotton featuring a subtle embroidered logo on the chest. Classic fit with ribbed collar and cuffs.",
  "price": 45.99,
  "color": {
    "primaryColor": ["navy"],
    "secondaryColor": null
  },
  "material": "cotton",
  "listed_size": "m",
  "category": "Tops",
  "subcategory": "Polo",
  "condition": "new_with_tags",
  "brand": "Polo Ralph Lauren",
  "gender": "Menswear",
  "tags": ["casual", "modern", "preppy"]
}
\`\`\`
`,
        },
        ...imageUrls.map((url) => ({
          type: 'image_url',
          image_url: { url },
        })),
      ],
    },
  ] as OpenAI.Chat.ChatCompletionMessageParam[];
}

class ProductClassifier {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async getRagContext(imageUrls: string): Promise<string> {
    try {
      // Make API call to your vector database backend
      const response = await fetch(`http://68.183.204.156:8882/api/rag/process_multimodal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrls,
          limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch RAG context');
      }
      const data = await response.json();
      const result = JSON.stringify(data.products) || '';
      console.log("This is the result: ", result);
      return result;
    } catch (error) {
      console.error('Error fetching RAG context:', error);
      return '';
    }
  }

  async classifyThreeImages(imageUrls: string[]): Promise<ProductResponse> {
    const messages = createThreeImageMessages(imageUrls);
    
    // Get relevant context from vector database
    const relevantContext = await this.getRagContext(imageUrls[0]);
    console.log("Relevant Context", relevantContext)
    // // Add context to the messages if available
    if (relevantContext) {
      messages.push({
        role: 'system',
        content: `Here is some relevant context about similar products:\n${relevantContext}\nUse this context to help classify the product more accurately.`
      });
    }

    // Make classification with context
    const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
      messages: messages,
      max_tokens: 500,
      temperature: 0
    });

    const rawJson = response.choices[0].message?.content?.replace(/```json\n?|```/g, '').trim();

    if (!rawJson) {
      throw new Error('No valid JSON received from the model.');
    }

      console.log('== Raw JSON ==\n', rawJson);
      const parsedContent = JSON.parse(rawJson);
      return ProductResponseSchema.parse(parsedContent);
    } catch (error: { errors: any; }) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error('Invalid response format from the AI model.');
      }
      throw error;
    }
  }

/**
 * Main function
 */
export async function main(imageUrls: string[]): Promise<ProductResponse> {
  console.log('== Clothing Analysis using OpenAI ==');
  const classifier = new ProductClassifier();
  const result = await classifier.classifyThreeImages(imageUrls);
  console.log('AI model returned:', result);
  return result;
}

export default main;
