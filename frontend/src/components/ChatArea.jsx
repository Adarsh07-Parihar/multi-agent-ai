import React, { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea() {
  const {selectedConversation}=useSelector(state=>state.conversation)
  const dispatch=useDispatch()
  useEffect(()=>{
    const getMesg=async () => {
      if(selectedConversation){
       if(selectedConversation.title=="New Chat") return;
       
       const data= await getMessages(selectedConversation?._id)
       console.log("Fetched messages:", data)
       dispatch(setMessages(data))
       
       // Find the most recent message with an artifact
       const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
       
       // ✅ FIX: Added the '?' before '.artifacts'
       dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
      }
    }

    getMesg()
  },[selectedConversation?._id, dispatch]) // Added dispatch to dependency array for good practice
  return (
    <div className='flex-1 flex flex-col min-w-0'>
      <Nav/>
      <MessageList/>
      <ChatInput/>
    </div>
  )
}

export default ChatArea
