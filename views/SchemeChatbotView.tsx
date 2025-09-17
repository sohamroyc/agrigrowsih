import React, { useState, useEffect, useRef } from 'react';
import { Scheme, ChatMessage } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { startSchemeChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import Card from '../components/Card';
import Button from '../components/Button';
// FIX: Import translations to resolve 'Cannot find name' errors.
import { translations } from '../i18n/translations';

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

interface SchemeChatbotViewProps {
  scheme: Scheme;
  onBack: () => void;
}

const SchemeChatbotView: React.FC<SchemeChatbotViewProps> = ({ scheme, onBack }) => {
  const { t, language } = useLocalization();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const getLang = (field: any) => field[language] || field.en;

  // FIX: Use 'as const' to create a specific string literal union type, avoiding the problematic 'symbol' from `keyof`.
  const promptStarters = [
    'prompt_starter_benefits',
    'prompt_starter_eligibility',
    'prompt_starter_documents',
  ] as const;

  useEffect(() => {
    // Initialize the chat session
    const chatInstance = startSchemeChat(scheme, language);
    setChat(chatInstance);
    
    const initialMessage = {
      sender: 'ai',
      text: `Hello! How can I help you with the "${getLang(scheme.title)}" scheme today?`,
    } as ChatMessage;
    setMessages([initialMessage]);
  }, [scheme, language]);

  // Speech Recognition Setup
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
    // Auto-scroll to the latest message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: messageText });
      let currentAiMessage = '';
      // Add a placeholder for the streaming response
      setMessages(prev => [...prev, { sender: 'ai', text: '...' }]); 
      
      for await (const chunk of responseStream) {
        currentAiMessage += chunk.text;
        // Update the last message in the array with the streaming content
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: 'ai', text: currentAiMessage + '...' };
          return newMessages;
        });
      }

      // Finalize the message without the ellipsis
       setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { sender: 'ai', text: currentAiMessage };
          return newMessages;
        });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
    setUserInput('');
  };

  // FIX: Use the specific inferred type from `promptStarters` for the `promptKey` parameter to ensure type safety.
  const handlePromptStarterClick = (promptKey: typeof promptStarters[number]) => {
      const promptText = t(promptKey);
      sendMessage(promptText);
  }

  const handleSpeak = (text: string) => {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
      } else {
          alert('Sorry, your browser does not support text-to-speech.');
      }
  };

  return (
    <Card className="flex flex-col h-[75vh]">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
             <button onClick={onBack} className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400">
                <i className="fas fa-arrow-left text-xl"></i>
             </button>
            <div>
                 <h2 className="text-xl font-bold text-green-800 dark:text-green-300">{t('scheme_chatbot_title')}</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Asking about: {getLang(scheme.title)}</p>
            </div>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-green-50/50 dark:bg-gray-900 my-4 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <i className="fas fa-robot text-xl text-green-600 dark:text-green-400 mb-2"></i>}
            <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-yellow-400 text-green-900 rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm rounded-bl-none'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
             {msg.sender === 'ai' && !isLoading && (
                <button onClick={() => handleSpeak(msg.text)} className="text-gray-400 hover:text-green-600 dark:hover:text-green-400" aria-label="Read message aloud">
                    <i className="fas fa-volume-up"></i>
                </button>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length-1].sender === 'user' && (
             <div className="flex items-end gap-2 justify-start">
                 <i className="fas fa-robot text-xl text-green-600 dark:text-green-400 mb-2"></i>
                 <div className="max-w-md p-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                 </div>
            </div>
        )}
      </div>

       {/* Prompt Starters */}
      {messages.length <= 1 && (
        <div className="pt-2 pb-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">Or, you can ask about:</p>
            <div className="flex flex-wrap justify-center gap-2">
                {promptStarters.map(key => (
                    <button key={key} onClick={() => handlePromptStarterClick(key)} className="px-3 py-1.5 text-sm bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-gray-600 transition-colors">
                        {t(key)}
                    </button>
                ))}
            </div>
        </div>
      )}


      <form onSubmit={handleFormSubmit} className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={isListening ? t('voice_search_listening') : t('chatbot_placeholder')}
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
          disabled={isLoading}
        />
        <Button
            type="button"
            variant="secondary"
            onClick={handleVoiceInput}
            disabled={isLoading || isListening}
            className={`rounded-full !px-5 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
            aria-label={t('start_voice_input')}
        >
            <i className={`fas ${isListening ? 'fa-microphone-alt' : 'fa-microphone'}`}></i>
        </Button>
        <Button type="submit" variant="secondary" disabled={isLoading || !userInput.trim()} className="rounded-full !px-5">
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </Button>
      </form>
    </Card>
  );
};

export default SchemeChatbotView;