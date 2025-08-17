import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MessageContent from '@/components/MessageContent';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Moon, 
  Sun, 
  Download, 
  Search, 
  Clock,
  FileText,
  Users,
  Gavel,
  Scale,
  MessageSquare,
  Mic,
  Paperclip
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { chatAPI } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [revisionInput, setRevisionInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    { text: "Contract Review", icon: FileText, category: "Contract Law" },
    { text: "Employment Rights", icon: Users, category: "Employment Law" },
    { text: "Family Matters", icon: Users, category: "Family Law" },
    { text: "Criminal Defense", icon: Gavel, category: "Criminal Law" },
    { text: "Business Formation", icon: Scale, category: "Business Law" },
    { text: "Real Estate", icon: FileText, category: "Real Estate Law" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize first session
    if (chatHistory.length === 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Legal Consultation",
        messages: [],
        lastUpdated: new Date()
      };
      setChatHistory([newSession]);
      setCurrentSessionId(newSession.id);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Call real API endpoint
      const response = await chatAPI.sendMessage(input, currentSessionId);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
      setIsTyping(false);
      updateCurrentSession([...messages, userMessage, aiMessage]);
      
      toast({
        title: "Response received",
        description: "Your legal consultation has been processed."
      });
    } catch (error) {
      setLoading(false);
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRevise = async () => {
    if (!revisionInput.trim() || messages.length === 0) return;

    setLoading(true);
    try {
      // Get the last user message and AI response for context
      const lastAiMessage = messages[messages.length - 1];
      const lastUserMessage = messages[messages.length - 2];
      
      if (lastAiMessage.sender === 'ai' && lastUserMessage?.sender === 'user') {
        // Format revision request for the API
        const revisionPrompt = `${lastUserMessage.content}\nCritique: ${revisionInput}`;
        
        // Call real API endpoint
        const response = await chatAPI.reviseResponse(revisionPrompt, currentSessionId);
        
        const revisedMessage: Message = {
          ...lastAiMessage,
          content: response.response,
          id: Date.now().toString(),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev.slice(0, -1), revisedMessage]);
        setRevisionInput('');
        updateCurrentSession([...messages.slice(0, -1), revisedMessage]);
      }
      setLoading(false);
      
      toast({
        title: "Response revised",
        description: "The legal advice has been updated based on your feedback."
      });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revise response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setShowQuickReplies(false);
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    setChatHistory(prev => 
      prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: newMessages, lastUpdated: new Date() }
          : session
      )
    );
  };

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Legal Consultation ${chatHistory.length + 1}`,
      messages: [],
      lastUpdated: new Date()
    };
    setChatHistory(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setShowQuickReplies(true);
  };

  const switchToSession = (sessionId: string) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowQuickReplies(session.messages.length === 0);
    }
  };

  const exportChatTranscript = async () => {
    try {
      // Call real API endpoint to get formatted transcript
      const response = await chatAPI.exportChat(currentSessionId);
      
      const blob = new Blob([response.transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal-consultation-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Chat exported",
        description: `Your conversation (${response.message_count} messages) has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export chat transcript.",
        variant: "destructive"
      });
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const filteredSessions = chatHistory.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold legal-heading">Chat History</h2>
            <Button size="sm" onClick={startNewSession} className="legal-button-hover">
              <MessageSquare className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id}
                className={`cursor-pointer transition-colors legal-card border ${
                  currentSessionId === session.id ? 'bg-primary/10 border-primary' : ''
                }`}
                onClick={() => switchToSession(session.id)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium truncate">{session.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(session.lastUpdated)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold legal-heading">Legal AI Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  {isTyping ? "AI is typing..." : "Professional legal guidance powered by AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportChatTranscript}
                disabled={messages.length === 0}
                className="legal-button-hover"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="legal-button-hover"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold legal-heading mb-2">
                  Welcome to LegalAI
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  I'm your AI legal assistant. Ask me anything about legal matters, contracts, 
                  regulations, or get help with document analysis.
                </p>
                
                {showQuickReplies && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                    {quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="legal-card border-2 h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => handleQuickReply(`I need help with ${reply.text.toLowerCase()}`)}
                      >
                        <reply.icon className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">{reply.text}</span>
                        <Badge variant="secondary" className="text-xs">
                          {reply.category}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                  <Avatar className="mt-1">
                    <AvatarFallback className={message.sender === 'user' ? 'chat-message-user' : 'bg-primary/10'}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`space-y-2 ${message.sender === 'user' ? 'mr-3' : 'ml-3'}`}>
                    <div className={`rounded-2xl p-4 ${
                      message.sender === 'user' 
                        ? 'chat-message-user text-primary-foreground' 
                        : 'chat-message-ai'
                    }`}>
                      <MessageContent 
                        content={message.content}
                        className="max-w-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary legal-spin" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="chat-message-ai rounded-2xl p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full legal-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full legal-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full legal-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Revision Input */}
            {messages.length > 0 && messages[messages.length - 1]?.sender === 'ai' && (
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask for revision or clarification..."
                  value={revisionInput}
                  onChange={(e) => setRevisionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRevise()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleRevise}
                  disabled={loading || !revisionInput.trim()}
                  size="sm"
                  variant="outline"
                  className="legal-button-hover"
                >
                  Revise
                </Button>
              </div>
            )}
            
            {/* Main Input */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Describe your legal question or upload a document..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="pr-20 min-h-[60px] resize-none"
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="lg"
                className="legal-button-hover px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              This AI provides general legal information and should not be considered as legal advice. 
              Consult with a qualified attorney for specific legal matters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;