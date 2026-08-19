import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
import redis from "../../../shared/redis/redis.js"

export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent } = req.body
        const file=req.file
        const userId=req.headers["x-user-id"]

        // Guard Check: Make sure environment variables exist
        if (!process.env.CHAT_SERVICE) {
            console.error("❌ BACKEND CONFIG ERROR: process.env.CHAT_SERVICE is not defined!");
            return res.status(500).json({ message: "Internal server configuration error." });
        }

        // 1. Save User Message to DB Microservice
        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId, role: "user", content: prompt
            })
        } catch (dbErr) {
            console.error("⚠️ Non-fatal DB Warning: Failed to save user message:", dbErr.message);
            // Optional: Choose whether to let the application continue or stop here
        }

        // 2. Invoke the Graph / Agent Logic
        const result = await graph.invoke({ prompt, conversationId, agent, userId, file })
        
        // Defensive Check: Ensure result exists before accessing properties
        const response = result?.aiResponse
        if (!response) {
            throw new Error("Graph invocation succeeded but returned an empty or invalid aiResponse.");
        }

        // 3. Update Memory State & Save Assistant Response
        await addMessage(conversationId, "user", prompt)
        await addMessage(conversationId, "assistant", response)

        try {
            await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
                conversationId, role: "assistant", content: response,images:result?.images,artifacts:result?.artifacts
            })
        } catch (dbErr) {
            console.error("⚠️ Non-fatal DB Warning: Failed to save assistant response:", dbErr.message);
        }

        // Return the clean string payload matching your React logic
        return res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })

    } catch (error) {
        next(error)
    }
}