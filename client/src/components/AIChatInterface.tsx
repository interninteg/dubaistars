import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";

type AIChatInterfaceProps = {
  className?: string;
};

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ className }) => {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Get chat history
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat'],
  });
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/chat");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
      toast({
        title: "Chat cleared",
        description: "Your chat history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearChatMutation.mutate();
    }
  };
  
  return (
    <div className={`bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-['Orbitron'] font-bold text-amber-400 flex items-center">
          <i className="ri-robot-line mr-2"></i> Space Travel Assistant
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleClearChat} 
          disabled={clearChatMutation.isPending}
          className="text-slate-300/70 hover:text-amber-400"
        >
          <i className="ri-delete-bin-line mr-1"></i> Clear Chat
        </Button>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto mb-4 pr-2 space-y-4"
      >
        {isLoading ? (
          <div className="text-center p-4">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-slate-300/50">No messages yet. Start a conversation!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
                  <i className="ri-robot-line"></i>
                </div>
              )}
              
              <div 
                className={`flex-1 rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-purple-700/20 max-w-[80%]' 
                    : 'bg-white/5'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none text-sm markdown-content">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-700/40 flex items-center justify-center text-purple-300">
                  <i className="ri-user-line"></i>
                </div>
              )}
            </div>
          ))
        )}
        
        {sendMessageMutation.isPending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
              <i className="ri-robot-line"></i>
            </div>
            <div className="flex-1 bg-white/5 rounded-lg p-3">
              <p className="text-sm flex items-center">
                <span className="inline-block w-2 h-2 bg-slate-100 rounded-full mr-1 animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-slate-100 rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-2 h-2 bg-slate-100 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about destinations, activities, or travel preparations..."
          className="w-full bg-black border border-white/20 rounded-md p-3 pl-4 pr-12 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
          disabled={sendMessageMutation.isPending}
        />
        <Button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-400/80 p-0 bg-transparent"
          onClick={handleSendMessage}
          disabled={sendMessageMutation.isPending || !message.trim()}
        >
          <i className="ri-send-plane-fill text-xl"></i>
        </Button>
      </div>
    </div>
  );
};

export default AIChatInterface;
