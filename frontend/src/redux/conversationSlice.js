import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [],
        selectedConversation: null
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action) => {
            state.conversations.unshift(action.payload);
        },
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload;
        },
        setConvTitle: (state, action) => {
            const { title, conversationId } = action.payload;
            
            // 1. Find the specific conversation in the array and update its title directly
            const conv = state.conversations.find(c => c._id === conversationId);
            if (conv) {
                conv.title = title;
            }

            // 2. Safely update the selected conversation title if it matches
            if (state.selectedConversation && state.selectedConversation._id === conversationId) {
                state.selectedConversation.title = title;
            }
        }
    }
});

export const { setConversations, addConversation, setSelectedConversation, setConvTitle } = conversationSlice.actions;
export default conversationSlice.reducer;