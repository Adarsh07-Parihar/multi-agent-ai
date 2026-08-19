import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codingAgent = async (state) => {
    try {
        await checkAgentLimit(state?.userId,"coding")
    const intentLlm = await getModel("intent")
    const llm = await getModel("coding")
    
    // 1. Split the generation intent into WEB_PROJECT and CODE_SNIPPET
    const intentRes = await intentLlm.invoke(`
        You are an intent classifier.

        Return ONLY one of these values.

        WEB_PROJECT
        CODE_SNIPPET
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION

        Rules:
        - Return WEB_PROJECT if the user wants a website, UI component, or frontend page (HTML/CSS/JS/React).
        - Return CODE_SNIPPET if the user wants a standalone script, algorithm, or backend code (e.g., Python, C++, Node script).

        User Request:
        ${state.prompt}
    `)
    
    const intent = intentRes.content.trim()

    // 2. Only enforce the JSON array structure for actual web projects
    if (intent === "WEB_PROJECT") {
        const prompt = `
            You are M.AI Coding Agent.

            Generate the requested web project.

            Default stack:
            - HTML
            - CSS
            - JavaScript

            Use React / Next.js / Vue ONLY if explicitly requested.

            Rules:
            - Responsive
            - Modern UI
            - CSS Variables
            - Flexbox/Grid
            - Smooth Scroll
            - Hover Effects
            - Beautiful spacing
            - Single page unless user asks otherwise.
            - Optimize the code heavily so that we are able to see the generated code in less tokens as we are using the free model. 

            IMAGES
            ---------------------
             Always use real Unsplash images.
             Never use placeholders.

            Return ONLY valid JSON

            Schema:
            {
            "files":[
            {
            "name":"index.html",
            "content":"..."
            },
            {
            "name":"style.css",
            "content":"..."
            },
            {
            "name":"script.js",
            "content":"..."
            }
            ]
            }

            Rules:
            - Output must start with {
            - Output must end with }
            - No markdown
            - No explanation
            - No extra text
            - No \`\`\`
            - Never mention intent

            User Request:
            ${state.prompt}
        `

        const res = await llm.invoke(prompt);

        let cleanedContent = res.content.replace(/```json\n?/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(cleanedContent);
            await deductCredits(state.userId, "coding")
        } catch (err) {
            console.error("Failed to parse LLM JSON output. This usually means the code was too long and got cut off.");
            return {
                ...state,
                aiResponse: "I tried to generate the code, but the project was too large and the response got cut off. Try asking for a smaller feature.",
                artifacts: []
            };
        }

        return {
            ...state,
            aiResponse: "Code Generated Successfully.",
            artifacts: [
                {
                    id: Date.now(),
                    type: "Project",
                    files: data.files || [],
                    title: state.prompt
                }
            ]
        };
    }

    // 3. Handle CODE_SNIPPET and all other intents via standard Markdown
    const res = await llm.invoke(`
        The user's request intent is classified as: ${intent}

        Return Markdown only.
        Never generate project files.

        Use headings like:
        # Overview
        ## The Code (if applicable)
        ## Explanation
        ## Problems
        ## Improvements
        ## Best Practices

        User request:
        ${state.prompt}
    `)
    
    const data = res.content
    await deductCredits(state.userId, "coding")
    
    return {
        ...state,
        aiResponse: data,
        artifacts: []
    }
    } catch (error) {
         console.log(error)
        return {
        ...state,
        aiResponse:error?.data?.message || "failed to generate code",
        artifacts: []
    }
    }
    
}