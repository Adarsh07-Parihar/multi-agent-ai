import { getModel } from "../config/llmModels.js"
import { agent } from "../controllers/agent.controller.js"

export const router = async (state) => {
    // If an agent is already manually chosen (e.g., "coding", "pdf"), keep it and move on
    if (state.agent && state.agent !== "auto") {
        return {
            ...state,
            agent: state.agent
        }
    }

    if(state.file){
        if(state.file.mimetype==="application/pdf"){
        return{
            ...state,
            agent:"pdfRag"
        }
    }

    
    if(state.file.mimetype.startsWith("image/")){
        return{
            ...state,
            agent:"imageAnalyzer"
        }
    }
    }

    

    const llm = await getModel("router")
    const prompt = `You are an agent router.
    
    Available agents:
    
    - chat
    - search
    - coding
    - pdf
    - ppt
    - vision
    
    Rules:
    
    chat:
    General conversation,
    explanations,
    learning,
    questions.
    
    search:
    Current events,
    latest information,
    news,
    recent developments,
    internet lookup.
    
    coding:
    Generate code,
    debug code,
    build projects,
    architecture,
    API design.
    
    pdf:
    Questions about generate PDFs
    or document context.
    
    ppt:
    Questions about generate ppts
    or ppt context.

    vision:
    Generate image,
    create image
    
    Return ONLY one word:
    
    chat
    search
    coding
    pdf
    ppt
    vision
    
    User Query:
    ${state.prompt}
    `

    const response = await llm.invoke(prompt)

    // 🚨 FIX: Extract the text from the LLM response, trim whitespace, and lowercase it
    // Note: Depending on your LLM setup, response might be a string or an object with a .content property
    const selectedAgent = (typeof response === 'string' ? response : response?.content || 'chat')
        .trim()
        .toLowerCase();

    // 🚨 FIX: Return the updated state object so the graph knows where to go next!
    return {
        ...state,
        agent: selectedAgent
    }
}