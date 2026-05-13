import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Send, BookOpen, HelpCircle, Lightbulb } from "lucide-react";

export default function AiTutor() {
  const { data: user } = useUser();
  const [messages, setMessages] = useState<any[]>([
    {
      id: "1",
      text: "Hello! I'm your AI study tutor. I can help you with:\n\n📚 Summarizing lecture notes\n❓ Answering study questions\n🎯 Explaining concepts\n📝 Creating quizzes\n🔄 Generating flashcards\n\nWhat would you like help with?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await supabase.from("ai_conversations").insert([
        {
          user_id: user.id,
          message_text: input,
          response_text: "",
          context_type: "general",
        },
      ]);

      const aiResponses = [
        "That's a great question! Let me help you understand this concept better. [AI Response would go here]",
        "I can help you with that! Here are some key points to remember: [AI Response would go here]",
        "Excellent! This is an important topic. Let me break it down for you: [AI Response would go here]",
        "I'd be happy to help! Here's what you should know: [AI Response would go here]",
      ];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage]);
        setLoading(false);
      }, 800);
    } catch (error) {
      toast.error("Error sending message");
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: <BookOpen className="w-5 h-5" />, label: "Summarize", action: "Summarize my lecture notes" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Explain", action: "Explain this concept" },
    { icon: <Lightbulb className="w-5 h-5" />, label: "Quiz", action: "Create a quiz for me" },
  ];

  return (
    <Layout>
      <div className="space-y-6 h-[calc(100vh-200px)] flex flex-col">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Study Tutor</h1>
          <p className="text-muted-foreground">Get instant help with your studies</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {messages.length === 1 && (
            <CardContent className="border-t border-border p-4">
              <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(action.action)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          )}

          <CardContent className="border-t border-border p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
