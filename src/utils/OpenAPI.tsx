import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import "@azure/openai/types";

// Set AZURE_OPENAI_ENDPOINT to the endpoint of your
// Azure OpenAI resource. You can find this in the Azure portal.
import "dotenv/config";

// Your Azure Cognitive Search endpoint, and index name
const azureSearchEndpoint = process.env["AZURE_SEARCH_ENDPOINT"] || "<search endpoint>";
const azureSearchIndexName = process.env["AZURE_SEARCH_INDEX"] || "<search index>";

export async function gen_product_data() {

    const scope = "https://cognitiveservices.azure.com/.default";
    const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);
    const deployment = "gpt-4-1106-preview";
    const apiVersion = "2024-07-01-preview";
    const client = new AzureOpenAI({ azureADTokenProvider, deployment, apiVersion });
    const events = await client.chat.completions.create({
        stream: true,
        messages: [
            {
                role: "user",
                content: `What's the most common feedback we received from our customers about the product?\n\n![Image](https://example.com/image.jpg)\nImage details: This is an example image.`,
            },
        ],
        max_tokens: 128,
        model: "",
    });

    for await (const event of events) {
        for (const choice of event.choices) {
            console.log(choice.delta?.content);
        }
    }
}


export default gen_product_data;