import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Scale, 
  FileText, 
  Users, 
  Gavel, 
  Home, 
  TrendingUp,
  Clock,
  MessageSquare,
  Upload,
  BookOpen,
  Calendar,
  Star,
  ArrowRight
} from "lucide-react";

const Dashboard = () => {
  const legalCategories = [
    {
      name: "Contract Law",
      icon: FileText,
      description: "Review, draft, and analyze contracts",
      consultations: 24,
      trending: true,
      color: "bg-blue-500"
    },
    {
      name: "Employment Law",
      icon: Users,
      description: "Workplace rights and employment issues",
      consultations: 18,
      trending: false,
      color: "bg-green-500"
    },
    {
      name: "Family Law",
      icon: Users,
      description: "Marriage, divorce, custody matters",
      consultations: 31,
      trending: true,
      color: "bg-purple-500"
    },
    {
      name: "Criminal Law",
      icon: Gavel,
      description: "Criminal defense and legal proceedings",
      consultations: 12,
      trending: false,
      color: "bg-red-500"
    },
    {
      name: "Real Estate Law",
      icon: Home,
      description: "Property transactions and disputes",
      consultations: 15,
      trending: true,
      color: "bg-orange-500"
    },
    {
      name: "Business Law",
      icon: Scale,
      description: "Corporate formation and compliance",
      consultations: 22,
      trending: false,
      color: "bg-indigo-500"
    }
  ];

  const recentConsultations = [
    {
      id: 1,
      title: "Employment Contract Review",
      category: "Employment Law",
      status: "Completed",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Rental Agreement Analysis",
      category: "Real Estate Law",
      status: "In Progress",
      timestamp: "1 day ago"
    },
    {
      id: 3,
      title: "Business Formation Guidance",
      category: "Business Law",
      status: "Completed",
      timestamp: "3 days ago"
    }
  ];

  const quickActions = [
    {
      title: "New Consultation",
      description: "Start a new legal consultation",
      icon: MessageSquare,
      link: "/chat",
      primary: true
    },
    {
      title: "Upload Document",
      description: "Analyze legal documents with AI",
      icon: Upload,
      link: "/document-analysis",
      primary: false
    },
    {
      title: "Legal Resources",
      description: "Browse guides and templates",
      icon: BookOpen,
      link: "/resources",
      primary: false
    },
    {
      title: "Schedule Meeting",
      description: "Book time with human lawyer",
      icon: Calendar,
      link: "/booking",
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold legal-heading">Legal Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Access comprehensive legal services and track your consultations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                Pro Plan
              </Badge>
              <Link to="/chat">
                <Button className="legal-button-hover">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold legal-heading mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className={`legal-card cursor-pointer ${
                  action.primary ? 'legal-gradient text-primary-foreground' : ''
                }`}>
                  <CardContent className="p-6 text-center">
                    <action.icon className={`h-8 w-8 mx-auto mb-3 ${
                      action.primary ? 'text-primary-foreground' : 'text-primary'
                    }`} />
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className={`text-sm ${
                      action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Usage Stats */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold legal-heading mb-6">Usage Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="legal-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Consultations This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold legal-heading">47</div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </div>
                <Progress value={78} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="legal-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documents Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold legal-heading">23</div>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <FileText className="h-4 w-4 mr-1" />
                  8 pending review
                </div>
                <Progress value={65} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="legal-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold legal-heading">32h</div>
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Estimated savings
                </div>
                <Progress value={85} className="mt-3" />
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Legal Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold legal-heading mb-6">Legal Service Areas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {legalCategories.map((category, index) => (
                <Link key={index} to={`/chat?category=${category.name.toLowerCase().replace(' ', '-')}`}>
                  <Card className="legal-card cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}/10`}>
                            <category.icon className={`h-6 w-6 text-${category.color.split('-')[1]}-500`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        {category.trending && (
                          <Badge variant="secondary" className="text-xs">
                            Trending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {category.consultations} consultations
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-semibold legal-heading mb-6">Recent Activity</h2>
            <Card className="legal-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Consultations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{consultation.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {consultation.category}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {consultation.timestamp}
                        </div>
                      </div>
                      <Badge 
                        variant={consultation.status === 'Completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <Link to="/history">
                  <Button variant="outline" className="w-full mt-4 legal-button-hover">
                    View All History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Satisfaction Score */}
            <Card className="legal-card mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Satisfaction Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold legal-heading text-primary mb-2">4.8</div>
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < 5 ? 'text-secondary fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your recent consultations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;