import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Scale, AlertTriangle, CheckCircle, Clock, Copy, RotateCcw, FileText, Loader2, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { analyzeCaseFormatted, healthCheck, type LegalAnalysis } from '@/lib/legalAdvisorAgent';
import { useNavigate } from 'react-router-dom';
import { StreamingLegalAnalyzer, type AnalysisStep, type StreamingAnalysisCallbacks } from '@/lib/streamingApi';
import { StreamingStepsDisplay } from '@/components/StreamingStepsDisplay';

const Analyze = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const streamingAnalyzer = useRef<StreamingLegalAnalyzer | null>(null);
  
  // State management
  const [caseDescription, setCaseDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<LegalAnalysis | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'degraded' | 'error'>('healthy');
  const [lastSubmittedDescription, setLastSubmittedDescription] = useState('');
  const [showCompleteAnalysis, setShowCompleteAnalysis] = useState(false);
  
  // Streaming analysis state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingSteps, setStreamingSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(12);
  const [streamingProgress, setStreamingProgress] = useState(0);

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

  // Streaming callbacks
  const streamingCallbacks: StreamingAnalysisCallbacks = {
    onStart: () => {
      setIsStreaming(true);
      setStreamingSteps([]);
      setCurrentStep(0);
      setStreamingProgress(0);
      setError(null);
      toast({
        title: "Analysis Started",
        description: "AI is beginning to analyze your case...",
      });
    },

    onStepStart: (step: AnalysisStep) => {
      setCurrentStep(step.step_number);
      setStreamingSteps(prev => {
        const existingIndex = prev.findIndex(s => s.step_number === step.step_number);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = step;
          return updated;
        }
        return [...prev, step].sort((a, b) => a.step_number - b.step_number);
      });
    },

    onStepComplete: (step: AnalysisStep) => {
      setStreamingSteps(prev => {
        const updated = prev.map(s => 
          s.step_number === step.step_number ? step : s
        );
        return updated.some(s => s.step_number === step.step_number) 
          ? updated 
          : [...updated, step].sort((a, b) => a.step_number - b.step_number);
      });
      
      const progress = Math.round((step.step_number / totalSteps) * 100);
      setStreamingProgress(Math.min(progress, 95));
    },

    onComplete: (analysisResult: any) => {
      setIsStreaming(false);
      setStreamingProgress(100);
      setAnalysis(analysisResult);
      setShowCompleteAnalysis(true);
      toast({
        title: "Analysis Complete",
        description: "Your legal case analysis is ready. Click 'Generate Report' to view the full analysis.",
      });
    },

    onError: (errorMessage: string) => {
      setIsStreaming(false);
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    },

    onProgress: (current: number, total: number) => {
      setTotalSteps(total);
      setCurrentStep(current);
      const progress = Math.round((current / total) * 100);
      setStreamingProgress(Math.min(progress, 95));
    }
  };

  // Handle case submission
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
    setAnalysis(null);
    setShowCompleteAnalysis(false);
    setStreamingSteps([]);
    setCurrentStep(0);
    setStreamingProgress(0);
    setLastSubmittedDescription(caseDescription);

    try {
      // Initialize streaming analyzer
      streamingAnalyzer.current = new StreamingLegalAnalyzer(streamingCallbacks);
      
      // Start streaming analysis
      await streamingAnalyzer.current.startAnalysis(caseDescription);
      
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
      setIsStreaming(false);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    if (analysis?.final_answer) {
      try {
        await navigator.clipboard.writeText(analysis.final_answer);
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
    // Close any existing streaming connection
    if (streamingAnalyzer.current) {
      streamingAnalyzer.current.close();
      streamingAnalyzer.current = null;
    }
    
    setCaseDescription('');
    setAnalysis(null);
    setError(null);
    setLastSubmittedDescription('');
    setShowCompleteAnalysis(false);
    setIsStreaming(false);
    setStreamingSteps([]);
    setCurrentStep(0);
    setStreamingProgress(0);
  };

  const handleGenerateReport = () => {
    if (analysis) {
      navigate('/results', { 
        state: { analysis },
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingAnalyzer.current) {
        streamingAnalyzer.current.close();
      }
    };
  }, []);

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
                  disabled={!isValidInput || loading || isStreaming}
                  className="w-full"
                >
                  {loading || isStreaming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isStreaming ? 'Streaming Analysis...' : 'Starting Analysis...'}
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Case
                    </>
                  )}
                </Button>
              </form>

              {/* Action Buttons */}
                {(analysis || error) && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button onClick={handleNewAnalysis} variant="outline" size="sm">
                    New Analysis
                  </Button>
                  {analysis && !showCompleteAnalysis && (
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
              {!loading && !isStreaming && !analysis && !error && (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-slate-500 dark:text-slate-400">
                    <Scale className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Ready for Analysis</p>
                    <p className="text-sm">Enter your case details and click "Analyze Case" to begin.</p>
                  </div>
                </div>
              )}

              {(loading || isStreaming) && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                      <Brain className="w-6 h-6 text-blue-600" />
                      {isStreaming ? 'Streaming Analysis' : 'Starting Analysis'}
                    </h3>
                    <Progress value={streamingProgress} className="w-full" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Step {currentStep} of {totalSteps} • {streamingProgress}% Complete
                    </p>
                  </div>

                  {/* Streaming Steps Display */}
                  {isStreaming && (
                    <StreamingStepsDisplay
                      steps={streamingSteps}
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      isStreaming={isStreaming}
                    />
                  )}
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

              {analysis && (
                <div className="flex-1 overflow-auto">
                  {/* Case Info */}
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {analysis.case_name || 'Legal Case Analysis'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Analysis Date: {analysis.analysis_date ? format(new Date(analysis.analysis_date), 'PPP') : format(new Date(), 'PPP')}</span>
                      {analysis.processing_time && <span>Processing Time: {analysis.processing_time}s</span>}
                      <span>Steps: {streamingSteps.length}</span>
                    </div>
                  </div>

                  {/* Streaming Steps Display */}
                  {streamingSteps.length > 0 && (
                    <div className="mb-6">
                      <StreamingStepsDisplay
                        steps={streamingSteps}
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        isStreaming={false}
                      />
                    </div>
                  )}

                  {/* Generate Report Button */}
                  {showCompleteAnalysis && (
                    <div className="text-center py-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                          Analysis Complete!
                        </h3>
                        <p className="text-green-700 dark:text-green-300 mb-4">
                          The AI has finished analyzing your case with {streamingSteps.length} detailed steps. Click below to view the comprehensive legal report.
                        </p>
                        <Button 
                          onClick={handleGenerateReport}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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