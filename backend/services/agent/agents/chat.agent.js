import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

    try {
        
        await checkAgentLimit(state?.userId,"chat")
        const llm = await getModel("chat")
    const history = await getMemory(state.conversationId)

    // 🔥 FIX: Clean and drastically compress the search data size
    let searchContext = ""
    if (state.searchResults && Array.isArray(state.searchResults)) {
        // Only extract the text snippets, and limit to the top 2-3 results max
        const cleanedResults = state.searchResults.slice(0, 3).map((result, index) => {
            return `Result [${index + 1}]: ${result.title || ''}\nSnippet: ${result.content || ''}`
        }).join("\n\n");

        searchContext = `
    Web Search Results:
    
    ${cleanedResults}
    
    Answer the user using only the above search results.`;
    }

    const systemPrompt = `You are M.AI where M stands for Multi if someone asks and you are an intelligent AI assistant and one more thing if someone asks who are you? answer you are M.AI don't give the model name.

     ${searchContext}

     If searchContext exists:
     - Use search results to answer.
     - Do not mention internal tools.

    Rules:
    - For simple questions, greetings, and short queries, respond naturally in plain text.
    - For technical, educational, coding, or detailed topics, use clean Markdown.

    Formatting:
    - Use # for titles and ## for sections.
    - Leave a blank line after headings.
    - Use bullet points for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs short and relatable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.`

    const messages = [
        new SystemMessage(systemPrompt)
    ]

    // 💡 Pro Tip Bonus: Only grab the last 4-6 messages from history 
    // to prevent the prompt from blowing up over time.
    const limitedHistory = history.slice(-6); 

    limitedHistory.forEach(msg => {
        if (msg.role == "user") {
            messages.push(new HumanMessage(msg.content))
        } if (msg.role == "assistant") {
            messages.push(new AIMessage(msg.content))
        }
    });

    messages.push(new HumanMessage(state.prompt))

    const response = await llm.invoke(messages)
    await deductCredits(state.userId,"chat")

    return {
        ...state,
        aiResponse: response.content
    }
    } catch (error) {
     console.log(error)
        return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate chat"
    }
    }
    
}