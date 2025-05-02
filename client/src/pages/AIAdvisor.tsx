import { useState } from "react";
import AIChatInterface from "@/components/AIChatInterface";
import { Button } from "@/components/ui/button";

const AIAdvisor: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  
  const suggestedQuestions = [
    "Which destination is best for first-time space travelers?",
    "What's included in the Ultimate package?",
    "How do I prepare for zero gravity environments?",
    "What are the medical requirements for Mars travel?",
    "What type of clothing should I pack for Mercury?",
    "How long is the journey to Saturn's rings?"
  ];
  
  const travelTips = [
    {
      icon: "ri-timer-line",
      tip: "Begin space adaptation training at least 3 months before your journey."
    },
    {
      icon: "ri-medicine-bottle-line",
      tip: "Pack motion sickness medication, as 60% of first-time space travelers experience space adaptation syndrome."
    },
    {
      icon: "ri-camera-line",
      tip: "Bring a high-quality camera with extra storage to capture the breathtaking views of Earth and space."
    },
    {
      icon: "ri-heart-pulse-line",
      tip: "Stay hydrated! Dehydration occurs more quickly in space environments."
    },
    {
      icon: "ri-rocket-line",
      tip: "Use your time in transit to learn local customs of your destination colony."
    }
  ];
  
  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-center mb-2">
          <span className="text-amber-400">AI Travel</span> <span className="text-slate-100">Advisor</span>
        </h1>
        <p className="text-center text-slate-300/70 max-w-2xl mx-auto">
          Get personalized recommendations and insights from our advanced space travel assistant. Ask about destinations, accommodations, or travel tips.
        </p>
      </div>

      {/* AI Advisor Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <AIChatInterface 
            className={selectedQuestion ? "chat-with-question" : ""} 
          />
        </div>

        {/* Quick Questions & Tips */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <h2 className="text-lg font-['Orbitron'] font-bold mb-4 text-amber-400">Suggested Questions</h2>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors text-sm justify-start"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <h2 className="text-lg font-['Orbitron'] font-bold mb-4 text-amber-400">Travel Tips</h2>
            <div className="space-y-3">
              {travelTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <i className={`${tip.icon} text-amber-400 mt-1`}></i>
                  <p className="text-sm">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <h2 className="text-lg font-['Orbitron'] font-bold mb-4 text-amber-400">Destination Highlights</h2>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                  alt="Mars surface" 
                  className="w-full h-32 object-cover"
                />
                <div className="p-3 bg-white/5">
                  <h3 className="font-bold text-sm">Mars: The Red Planet</h3>
                  <p className="text-xs text-slate-300/70 mt-1">Experience the rusty landscapes and explore the ancient riverbeds of our neighboring planet.</p>
                </div>
              </div>
              <Button 
                className="w-full text-sm bg-purple-700 hover:bg-purple-700/80"
                onClick={() => handleQuestionClick("Tell me more about Mars as a destination")}
              >
                Ask about Mars
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
