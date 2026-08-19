import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

// 1. Define placeholders so we don't recreate them on every function call
let groqInstance = null;
let geminiInstance = null;
let openRouterInstance = null;

const getGroqModel = () => {
    if (!groqInstance) {
        groqInstance = new ChatGroq({
            model: "openai/gpt-oss-120b" 
        });
    }
    return groqInstance;
};

const getGeminiModel = () => {
    if (!geminiInstance) {
        geminiInstance = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash"
        });
    }
    return geminiInstance;
};

const getOpenRouterModel = () => {
    if (!openRouterInstance) {
        openRouterInstance = new ChatOpenRouter({
            model: "openrouter/free",
            temperature:0,
        });
    }
    return openRouterInstance;
};

export const getModel = async (agent) => {
    switch (agent) {
        case "chat":
             return getGroqModel();
        case "search":
            return getGroqModel();
        case "coding":
            return getOpenRouterModel();
        case "imageAnalyzer":
            return getOpenRouterModel();
        default:
            return getGroqModel();
    }
};