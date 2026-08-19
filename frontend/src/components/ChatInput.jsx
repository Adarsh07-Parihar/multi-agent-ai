import { Code2, FileText, FileTextIcon, Globe, ImageIcon, MessageSquare, Mic, MicOff, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { useRef } from 'react'

function ChatInput() {
    const [value, setValue] = useState("")
    const [selectedAgent, setSelectedAgent] = useState("Auto")
    const { selectedConversation } = useSelector(state => state.conversation)
    const {messages,isLoading} = useSelector(state=>state.message)
    const [selectedFile, setSelectedFile] = useState(null)
    const [listening, setListening] = useState(false)
    const recognitionRef = useRef(null)
    const fileRef = useRef(null)
    const dispatch = useDispatch()

    useEffect(()=>{
        const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition
        if(!SpeechRecognition)return;

        const recognition=new SpeechRecognition()
        recognition.lang="en-US"
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult=(event)=>{
            let transcript=""

            for (let index = event.resultIndex; index < event.results.length; index++) {

                transcript+=event.results[index][0].transcript
                
            }
            setValue(transcript)
        }

        recognition.onend=()=>{
            setListening(false)
        }

        recognitionRef.current=recognition
    },[])

    const toggleMic=()=>{
        if(!recognitionRef.current){
            alert("speech recognition not supported")
        }
        if(listening){
            recognitionRef.current.stop()
            setListening(false)
        }else{
            recognitionRef.current.start()
            setListening(true)
        }
    }

   const handleSendMessage = async () => {
    if (!value.trim()) return;
    dispatch(setIsLoading(true))
    let conversation = selectedConversation;
    const currentPrompt = value.trim();

    try {
        // 1. Initialize conversation if it doesn't exist
        if (!conversation) {
            const conv = await createConversation();
            dispatch(setSelectedConversation(conv));
            dispatch(addConversation(conv));
            conversation = conv;
        }

        // 2. Update conversation title if it's new
        if (conversation?.title === "New Chat") {
            await updateConversation({ id: conversation?._id, title: currentPrompt });
            dispatch(setConvTitle({ conversationId: conversation?._id, title: currentPrompt.slice(0, 40) }));
        }

        // 3. Dispatch user message & clear input *after* successful prep setup
        dispatch(addMessage({ role: "user", content: currentPrompt }));
        setValue("");

        
        const formData=new FormData()
        formData.append("prompt",currentPrompt)
        formData.append("conversationId",conversation?._id)
        formData.append("agent",selectedAgent.toLowerCase())
        if(selectedFile){
            formData.append("file",selectedFile)
        }
        
        

        // 4. Await response from server
        const data = await sendMessage(formData);
        dispatch(setIsLoading(false))
        setSelectedFile(null)
dispatch(setArtifacts(data?.artifacts || []));

        // 5. Dispatch success answer (checking for both answer and aiResponse)
        const responseContent = data?.answer || data?.aiResponse;

        if (responseContent) {
            dispatch(addMessage({ role: "assistant", content: responseContent, images: data?.images }));
        } else {
            // Fallback just in case backend resolves with an empty body instead of throwing
            throw new Error("Empty response received from agent.");
        }

    } catch (err) {
        console.error("Failed in handleSendMessage flow:", err);
        
        // 🔥 FIX: Dispatch the fallback error message safely here inside the catch block
        dispatch(addMessage({ 
            role: "assistant", 
            content: "⚠️ Error: The server encountered an issue processing your request (Internal Server Error). Please check your backend logs." 
        }));
    } finally {
        setIsLoading(false); // Re-enable UI components
    }
};

    const agents = [
        { id: "auto", icon: Zap, label: "Auto" },
        { id: "chat", icon: MessageSquare, label: "Chat" },
        { id: "coding", icon: Code2, label: "Coding" },
        { id: "pdf", icon: FileText, label: "PDF" },
        { id: "ppt", icon: Presentation, label: "PPT" },
        { id: "vision", icon: ImageIcon, label: "Vision" },
        { id: "search", icon: Globe, label: "Search" }
    ]

    return (
        <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]'>
            <div className='flex flex-col gap-2 bg-white/3 border border-white/7 rounded-2xl px-4 pt-3.5 pb-3'>

                <div className='flex w-[80%] gap-2 pr-2 flex-wrap'>
                    {agents.map((agent) => {
                        const isActive = selectedAgent === agent.label
                        const Icon = agent.icon
                        return (
                            <div 
                                key={agent.id}
                                onClick={() =>  setSelectedAgent(agent.label)} 
                                className={`shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                                    isActive 
                                        ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                                        : "bg-white/3 text-slate-400 border-white/6 hover:bg-white/7"
                                } `}
                            >
                                <Icon size={14} className={isActive ? "text-white" : "text-slate-500"}/>
                                {agent.label}
                            </div>
                        )
                    })}
                </div>

               
               {selectedFile && 
               <div className='my-3'>
                <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2'>
                {
                    selectedFile?.type === "application/pdf" ? <FileTextIcon size={16}
                    className='text-red-400'
                    />:selectedFile?.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)}
                    className='h-10 w-10 rounded-xl object-cover mt-3'/>
                }
                 <div>
                    <p className='text-xs text-white'>
                        {selectedFile?.name}
                    </p>
                    <p className='text-[10px] text-slate-500'>
                        {Math.ceil(selectedFile.size)}KB
                    </p>
                </div>
                <button className='ml-2' onClick={()=>{setSelectedFile(null); fileRef.current.value=""}}><X size={14} className='text-slate-500 hover:text-white cursor-pointer'/></button>
                </div>
               
               </div>
               }

                <textarea
                    placeholder={'Ask Anything...'}
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    className='w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50'
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
                />
                
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>

                        <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e)=>{
                            const file=e.target.files[0]
                            if(file){
                                 setSelectedFile(file)
                            }
                           
                        }}/>

                        <button  className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50'
                         onClick={()=>fileRef.current.click()}>
                            <Paperclip size={16}/>
                        </button>
                        <button 
                        onClick={toggleMic}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg  transition-all duration-150  cursor-pointer
                         ${listening ? "bg-red-500 text-white" : "text-slate-600 hover:bg-white/5"}`}>
                           {listening?<Mic size={16}/>:<MicOff size={16}/>} 
                        </button>
                    </div>
                    <button
                        disabled={!value.trim() && isLoading} // 👈 Added attribute
                        onClick={handleSendMessage}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border-none transition-all duration-150 cursor-pointer ${
                            value.trim()
                                ? "bg-linear-to-br from-indigo-500 to-violet-950 text-white hover:opacity-90" 
                                : "cursor-not-allowed bg-white/5 text-slate-600"
                        }`}
                    >
                        <Send size={15}/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatInput