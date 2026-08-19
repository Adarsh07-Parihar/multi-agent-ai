import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"

export const createConversation=async (req,res) => {
    try {
        const userId=req.headers["x-user-id"]
        const conversation=await Conversation.create({
            userId:userId
        })

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({message:`create conversation error ${error}`})
    }
}


export const getConversations=async (req,res) => {
    try {
        const userId=req.headers["x-user-id"]
        console.log("userId",userId)
        const conversations=await Conversation.find({
            userId:userId
        }).sort({updatedAt:-1})

        return res.status(200).json(conversations)
    } catch (error) {
        return res.status(500).json({message:`get conversation error ${error}`})
    }
}

export const updateConversation = async (req,res) => {
    try {
        const {id, title} = req.body
        const conversation = await Conversation.findByIdAndUpdate(id, {
            title
        }, { new: true }) // ✅ ADDED { new: true }

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({message:`update conversation error ${error}`})
    }
}

export const saveMessage = async (req,res) => {
    try {
        const {conversationId, role, content, images, artifacts} = req.body
        
        let formattedArtifacts = [];
        
        if (artifacts) {
            // ✅ FIX: If LangGraph already wrapped it in an array, use it directly
            if (Array.isArray(artifacts) && artifacts.length > 0) {
                formattedArtifacts = artifacts;
            } 
            // Fallback: If it arrives as a single object somehow
            else if (artifacts.files) {
                formattedArtifacts = [{
                    id: Date.now(),
                    type: "code_generation",
                    title: artifacts.title || "Code Generation", // Ensure title is grabbed
                    files: artifacts.files
                }];
            }
        }

        const message = await Message.create({
            conversationId,
            content: typeof content === 'object' ? JSON.stringify(content) : content,
            role,
            images,
            artifacts: formattedArtifacts // Now it will save properly!
        })
        return res.status(200).json(message)
    } catch (error) {
        return res.status(500).json({message:`save message error ${error}`})
    }
}

export const getMessages=async (req,res) => {
    try {
        const messages=await Message.find({
            conversationId:req.params.conversationId
        })
         return res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json({message:`get messages error ${error}`})
    }
}