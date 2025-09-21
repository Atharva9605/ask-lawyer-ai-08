import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Scale, AlertTriangle, CheckCircle, Clock, Copy, RotateCcw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { healthCheck } from '@/lib/legalAdvisorAgent';
import { StreamingLegalAnalyzer } from '@/lib/streamingApi';
import { useNavigate } from 'react-router-dom';

const Analyze = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State management
  const [caseDescription, setCaseDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'error'>('healthy');
  const [progressPercent, setProgressPercent] = useState(0);
  const [lastSubmittedDescription, setLastSubmittedDescription] = useState('');

  const charCount = caseDescription.length;
  const minChars = 50;
  const isValidInput = charCount >= minChars;

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setHealthStatus('healthy');
      } catch (error) {
        setHealthStatus('error');
      }
    };
    checkHealth();
  }, []);

  // Handle case submission with streaming
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidInput) {
      toast({
        title: "Input too short",
        description: `Please provide at least ${minChars} characters describing your case.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setStreamingContent('');
    setAnalysisComplete(false);
    setProgressPercent(10);
    setLastSubmittedDescription(caseDescription);

    try {
      const analyzer = new StreamingLegalAnalyzer({
        onStart: () => {
          console.log('Analysis started');
          setProgressPercent(20);
        },
        onData: (data: string) => {
          setStreamingContent(prev => prev + data);
          setProgressPercent(prev => Math.min(prev + 1, 90));
        },
        onComplete: (fullResponse: string) => {
          setStreamingContent(fullResponse);
          setAnalysisComplete(true);
          setProgressPercent(100);
          setLoading(false);
          toast({
            title: "Analysis Complete",
            description: "Your legal analysis has been completed successfully.",
          });
        },
        onError: (errorMsg: string) => {
          setError(errorMsg);
          setLoading(false);
          toast({
            title: "Analysis Failed",
            description: errorMsg,
            variant: "destructive"
          });
        }
      });

      await analyzer.startAnalysis(caseDescription);
    } catch (error) {
      console.error('Analysis error:', error);
      let errorMessage = 'Analysis failed, please try again';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = 'API rate limit reached. Please try again in a few minutes.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    if (lastSubmittedDescription) {
      setCaseDescription(lastSubmittedDescription);
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }, 100);
    }
  };

  const handleCopyAnalysis = async () => {
    if (streamingContent) {
      try {
        await navigator.clipboard.writeText(streamingContent);
        toast({
          title: "Copied to Clipboard",
          description: "Legal analysis has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy to clipboard. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleNewAnalysis = () => {
    setCaseDescription('');
    setStreamingContent('');
    setAnalysisComplete(false);
    setError(null);
    setProgressPercent(0);
    setLastSubmittedDescription('');
  };

  const handleGenerateReport = () => {
    if (streamingContent) {
      // Create a mock analysis object for the results page
      const mockAnalysis = {
        case_name: "Legal Case Analysis",
        analysis_date: new Date().toISOString(),
        processing_time: "5.2",
        total_steps: 4,
        thinking_steps: [],
        final_answer: streamingContent,
        links: []
      };
      
      navigate('/results', { 
        state: { analysis: mockAnalysis },
        replace: false 
      });
    }
  };

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getHealthText = () => {
    switch (healthStatus) {
      case 'healthy': return 'AI Service Online';
      case 'degraded': return 'Service Degraded';
      case 'error': return 'Service Offline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Scale className="w-8 h-8 text-amber-600" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Legal Case Analysis</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered legal analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              {getHealthIcon()}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {getHealthText()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Panel - Case Input */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Case Description
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Describe your legal case in detail. Include relevant facts, parties involved, specific legal questions, and any evidence you have..."
                    value={caseDescription}
                    onChange={(e) => setCaseDescription(e.target.value)}
                    className="min-h-[300px] resize-none"
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-sm ${charCount < minChars ? 'text-red-500' : 'text-green-600'}`}>
                      {charCount}/{minChars} characters minimum
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValidInput || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Case...
                    </>
                  ) : (
                    'Analyze Case'
                  )}
                </Button>
              </form>

              {/* Action Buttons */}
                {(streamingContent || error) && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button onClick={handleNewAnalysis} variant="outline" size="sm">
                    New Analysis
                  </Button>
                  {streamingContent && !analysisComplete && (
                    <Button onClick={handleCopyAnalysis} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Analysis
                    </Button>
                  )}
                  {error && (
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6 h-full flex flex-col">
              {!loading && !streamingContent && !error && (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-slate-500 dark:text-slate-400">
                    <Scale className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Ready for Analysis</p>
                    <p className="text-sm">Enter your case details and click "Analyze Case" to begin.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Analyzing Your Case
                    </h3>
                    <Progress value={progressPercent} className="w-full" />
                  </div>

                  {/* Multi-Step Analysis Progress */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          🧠 Initial Legal Analysis
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          AI is examining case facts and identifying key legal issues...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          🔎 Legal Research & Citations
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          AI is searching for relevant laws, precedents, and regulations...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          ✅ Legal Review & Synthesis
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          AI is synthesizing findings and preparing recommendations...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          📝 Final Legal Opinion
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          AI is formatting the comprehensive legal analysis...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-red-500">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Analysis Failed</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                  </div>
                </div>
              )}

              {streamingContent && (
                <div className="flex-1 overflow-auto">
                  {/* Streaming Analysis Display */}
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Legal Case Analysis
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Analysis Date: {format(new Date(), 'PPP')}</span>
                      <span>Status: {analysisComplete ? 'Complete' : 'Streaming...'}</span>
                    </div>
                  </div>

                  {/* Streaming Content */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {streamingContent}
                      </pre>
                      {!analysisComplete && (
                        <div className="inline-flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-slate-500">AI is writing...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Report Button */}
                  {analysisComplete && (
                    <div className="text-center py-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                          Analysis Complete!
                        </h3>
                        <p className="text-green-700 dark:text-green-300 mb-4">
                          The AI has finished analyzing your case. Click below to view the detailed legal report.
                        </p>
                        <Button 
                          onClick={handleGenerateReport}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white legal-button-hover"
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          Generate Full Report
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analyze;