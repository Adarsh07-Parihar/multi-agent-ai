import 'dotenv/config';
import { searchtool } from "../config/tavily.js"
import { deductCredits } from '../utils/deductCredits.js';
import { checkAgentLimit } from '../config/agentLimit.js';

export const searchAgent=async (state) => {
    try {
        await checkAgentLimit(state?.userId,"search")
        const results=await searchtool.invoke({
            query:state.prompt
        })
         await deductCredits(state.userId,"search")
        console.log(results)
        return {
            ...state,
            searchResults:results,
            images:results.images
        }
    } catch (error) {
          console.log(error)
        return {
        ...state,
        searchResults:[],
         images:[],
        aiResponse:error?.data?.message || "failed to search"
    }
    }
}