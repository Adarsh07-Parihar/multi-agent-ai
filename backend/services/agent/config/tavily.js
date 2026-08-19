import { TavilySearch } from "@langchain/tavily";

export const searchtool = new TavilySearch({
  maxResults: 2,
  topic: "general",
  includeImages:true,
  tavilyApiKey:process.env.TAVILY_API_KEY
});
