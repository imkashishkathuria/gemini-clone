import { createContext, useEffect, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) =>{

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const initializePrompts = () => {
            const savedPrompts = localStorage.getItem('prompts');
            if (savedPrompts) {
                try {
                    const parsedPrompts = JSON.parse(savedPrompts);
                    if (Array.isArray(parsedPrompts)) {
                        setPrevPrompts(parsedPrompts);
                    } else {
                        console.error('Invalid prompts format in localStorage.');
                        setPrevPrompts([]);
                    }
                } catch (error) {
                    console.error('Error parsing prompts from localStorage:', error);
                    setPrevPrompts([]);
                }
            } else {
                setPrevPrompts([]); 
            }
        };

        const addPrompt = (newPrompt) =>{
        
            console.log("Adding new prompt:", newPrompt); 
            const updatedPrompts = [...(prevPrompts || []), newPrompt];
            setPrevPrompts(updatedPrompts);
            localStorage.setItem("prompts",JSON.stringify(updatedPrompts));
            
        }

    const delayPara = (index, nextWord) =>{
        setTimeout(function(){
            setResultData(prev=>prev+nextWord);
        },75*index);
    }

    const newChat = () =>{
        setLoading(false);
        setShowResult(false);
    }

    const onSent = async(prompt) =>{
        setResultData("");
        setLoading(true);
        setShowResult(true);

        let response;
        if(prompt !== undefined){
            response = await run(prompt);
            setRecentPrompt(prompt);
            addPrompt(prompt)
        }
        
        else{
            setPrevPrompts(prev=>[...prev, input])
            setRecentPrompt(input);
            response =await run(input);
            addPrompt(input)
        }

    //     setRecentPrompt(input);
    //     setPrevPrompts(prev=>[...prev, input])
    //    const response =  await run(input);
       let responseArray = response.split("**");
    //    console.log(responseArray)
    let newResponse = "";
    for(let i=0; i<responseArray.length; i++){
        if(i===0 || i%2!==1){
            newResponse +=responseArray[i];
        }
        else{
            newResponse += "<b>"+responseArray[i]+"</b>";
        }
    }
    let newResponse2 = newResponse.split("*").join("<br>")
      let newResponseArray = newResponse2.split(" ");
      for(let i=0; i<newResponseArray.length; i++){
        const nextWord = newResponseArray[i];
        delayPara(i, nextWord+" ");
      }
       setLoading(false);
       setInput("");
    }
    useEffect(()=>{
        initializePrompts();
    },[])

    const contextValue = {
        input, setInput,
        recentPrompt, setRecentPrompt,
        prevPrompts, setPrevPrompts,
        showResult, setShowResult,
        loading, setLoading,
        resultData, setResultData,
        onSent,
        newChat
    }

    return(
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default  ContextProvider