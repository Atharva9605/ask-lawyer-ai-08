import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Eye,
  Trash2,
  Clock,
  Scale,
  User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: {
    documentType: string;
    riskLevel: 'low' | 'medium' | 'high';
    keyFindings: string[];
    recommendations: string[];
    summary: string;
  };
}

const DocumentAnalysis = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    fileList.forEach(file => {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive"
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive"
        });
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0
      };

      setFiles(prev => [...prev, newFile]);
      simulateUploadAndAnalysis(newFile.id);
    });
  };

  const simulateUploadAndAnalysis = (fileId: string) => {
    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'processing', progress: 100 }
            : file
        ));

        // Simulate analysis
        setTimeout(() => {
          const mockAnalysis = {
            documentType: "Employment Contract",
            riskLevel: 'medium' as const,
            keyFindings: [
              "Non-compete clause may be overly restrictive",
              "Termination notice period is standard",
              "Intellectual property assignment clause present",
              "Benefits package appears competitive"
            ],
            recommendations: [
              "Consider negotiating the non-compete duration",
              "Clarify remote work policies",
              "Review intellectual property ownership terms",
              "Confirm health insurance coverage details"
            ],
            summary: "This employment contract contains standard terms with some areas that warrant attention. The non-compete clause may be restrictive and should be carefully reviewed. Overall compensation and benefits appear fair for the position level."
          };

          setFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed', analysis: mockAnalysis }
              : file
          ));

          toast({
            title: "Analysis complete",
            description: "Your document has been successfully analyzed.",
          });
        }, 3000);
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress }
            : file
        ));
      }
    }, 200);
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File deleted",
      description: "The file has been removed from analysis.",
    });
  };

  const downloadReport = (file: UploadedFile) => {
    if (!file.analysis) return;
    
    const report = `
LEGAL DOCUMENT ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
Document: ${file.name}
Type: ${file.analysis.documentType}
Risk Level: ${file.analysis.riskLevel.toUpperCase()}

SUMMARY:
${file.analysis.summary}

KEY FINDINGS:
${file.analysis.keyFindings.map((finding, i) => `${i + 1}. ${finding}`).join('\n')}

RECOMMENDATIONS:
${file.analysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

This analysis is provided by LegalAI for informational purposes only and should not be considered as legal advice.
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}-analysis-report.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "Analysis report has been saved to your device.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold legal-heading">Document Analysis</h1>
              <p className="text-muted-foreground mt-1">
                Upload legal documents for AI-powered analysis and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                <FileText className="h-3 w-3 mr-1" />
                {files.length} documents
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Drop your documents here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Supports PDF, DOC, DOCX, and TXT files up to 10MB
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="legal-button-hover">
                      Choose Files
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card className="legal-card">
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div key={file.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <FileText className="h-8 w-8 text-primary mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium">{file.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {file.uploadedAt.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.status === 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadReport(file)}
                                    className="legal-button-hover"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteFile(file.id)}
                                className="legal-button-hover text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {(file.status === 'uploading' || file.status === 'processing') && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">
                                  {file.status === 'uploading' ? 'Uploading...' : 'Analyzing...'}
                                </span>
                                <span className="text-muted-foreground">
                                  {file.status === 'uploading' ? `${Math.round(file.progress)}%` : 'Processing'}
                                </span>
                              </div>
                              <Progress 
                                value={file.status === 'uploading' ? file.progress : undefined} 
                                className={file.status === 'processing' ? 'legal-pulse' : ''}
                              />
                            </div>
                          )}

                          {/* Analysis Results */}
                          {file.status === 'completed' && file.analysis && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {file.analysis.documentType}
                                </Badge>
                                <Badge className={`text-xs border ${getRiskColor(file.analysis.riskLevel)}`}>
                                  {file.analysis.riskLevel.toUpperCase()} RISK
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {file.analysis.summary}
                              </p>
                              
                              <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <h5 className="font-medium mb-1 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" />
                                    Key Findings
                                  </h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {file.analysis.keyFindings.slice(0, 2).map((finding, i) => (
                                      <li key={i}>• {finding}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-1 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                    Recommendations
                                  </h5>
                                  <ul className="space-y-1 text-muted-foreground">
                                    {file.analysis.recommendations.slice(0, 2).map((rec, i) => (
                                      <li key={i}>• {rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {file.status === 'error' && (
                            <div className="flex items-center text-sm text-destructive">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Analysis failed. Please try uploading again.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Info & Stats */}
          <div className="space-y-6">
            {/* Analysis Tips */}
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Scale className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Supported Documents</p>
                    <p className="text-muted-foreground">Contracts, agreements, legal notices, court documents</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">File Requirements</p>
                    <p className="text-muted-foreground">PDF, DOC, DOCX, TXT • Max 10MB • Clear text</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Privacy & Security</p>
                    <p className="text-muted-foreground">All documents are encrypted and processed securely</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Stats */}
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="text-lg">Analysis Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold legal-heading text-primary">156</div>
                  <p className="text-sm text-muted-foreground">Documents analyzed this month</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">94%</div>
                    <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">2.3s</div>
                    <p className="text-xs text-muted-foreground">Avg. Processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Employment Contract</span>
                    <Badge variant="outline" className="text-xs">Medium Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NDA Agreement</span>
                    <Badge variant="outline" className="text-xs">Low Risk</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Service Agreement</span>
                    <Badge variant="outline" className="text-xs">High Risk</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;