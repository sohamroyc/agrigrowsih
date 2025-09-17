import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ChatMessage } from '../types';
import { startGeneralChat } from '../services/geminiService';
import { Chat } from '@google/genai';

// Type definitions for the Web Speech API
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: Event) => void;
    start(): void;
}
interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const Chatbot: React.FC = () => {
  const { t, language } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize or re-initialize chat when language changes
    const chatInstance = startGeneralChat(language);
    setChat(chatInstance);
    // Reset messages on language change
    setMessages([{ sender: 'ai', text: t('chatbot_greeting') }]);
  }, [language, t]);

  // Web Speech API setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = userInput;
    setUserInput('');
    setIsLoading(true);
    
    try {
      const responseStream = await chat.sendMessageStream({ message: messageToSend });
      
      let fullResponse = '';
      let isFirstChunk = true;

      for await (const chunk of responseStream) {
        fullResponse += chunk.text;

        if (isFirstChunk) {
          // Add a new AI message with the first chunk
          setMessages(prev => [...prev, { text: fullResponse, sender: 'ai' }]);
          isFirstChunk = false;
        } else {
          // Update the last message (which is the AI's)
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullResponse;
            return newMessages;
          });
        }
      }
    } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage: ChatMessage = { text: "Sorry, something went wrong. Please try again.", sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {/* Chat Window */}
      <div className={`w-80 md:w-96 h-[50vh] md:h-[60vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <header className="bg-green-700 text-white p-3 rounded-t-xl flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-lg">{t('chatbot_title')}</h3>
          <button onClick={() => setIsOpen(false)} className="hover:text-yellow-300">
            <i className="fas fa-times"></i>
          </button>
        </header>
        <div className="flex-grow p-3 overflow-y-auto space-y-3 bg-green-50 dark:bg-gray-900">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-yellow-400 text-green-900 rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm rounded-bl-none'}`} style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <div className="flex items-end gap-2 justify-start">
               <div className="max-w-[80%] p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isListening ? t('voice_search_listening') : t('chatbot_input_placeholder')}
            className="flex-grow px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading}
          />
           <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading || isListening}
            className={`w-10 h-10 flex-shrink-0 text-white rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'}`}
            aria-label={t('start_voice_input')}
          >
            <i className={`fas ${isListening ? 'fa-microphone-alt' : 'fa-microphone'}`}></i>
          </button>
          <button type="submit" disabled={isLoading || !userInput.trim()} className="w-10 h-10 flex-shrink-0 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 ease-in-out fixed bottom-5 right-5 md:bottom-24 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Toggle Chatbot"
      >
        <i className="fas fa-comment-dots"></i>
      </button>
    </div>
  );
};

export default Chatbot;