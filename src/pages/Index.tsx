import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User as UserIcon,
  Wallet,
  FileText,
  TrendingUp,
  Users,
  Vote,
  Plus,
  Search,
  Shield,
  Sparkles,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Award,
  Brain,
  Globe,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from 'lucide-react';

// Firebase configuration (using placeholder variables that would be injected)
const firebaseConfig = {
  apiKey: "__firebase_config",
  authDomain: "__firebase_config",
  projectId: "__firebase_config",
  storageBucket: "__firebase_config",
  messagingSenderId: "__firebase_config",
  appId: "__app_id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Mock data structures
interface UserProfile {
  id: string;
  name: string;
  did: string;
  profilePicture: string;
  overallReputation: number;
  riaBalance: number;
  reputationBreakdown: {
    overall: number;
    tailoring: number;
    punctuality: number;
    financialTrust: number;
    communityContribution: number;
  };
  verifiableCredentials: VerifiableCredential[];
}

interface VerifiableCredential {
  id: string;
  type: string;
  issuer: string;
  status: 'verified' | 'pending' | 'expired';
  issuedDate: string;
}

interface IOU {
  id: string;
  type: 'service' | 'good';
  description: string;
  value: number;
  issuer: string;
  issuerName: string;
  recipient: string;
  recipientName: string;
  dueDate: string;
  status: 'outstanding' | 'fulfilled' | 'accepted';
  aiRiskScore?: number;
  aiTrustScore?: number;
  createdDate: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
  endDate: string;
  proposer: string;
}

// Mock data
const mockUser: UserProfile = {
  id: 'user123',
  name: 'Alex Rivera',
  did: 'did:ria:0x1234567890abcdef',
  profilePicture: 'https://placehold.co/100x100/6366f1/ffffff?text=AR',
  overallReputation: 852,
  riaBalance: 2450,
  reputationBreakdown: {
    overall: 85,
    tailoring: 92,
    punctuality: 88,
    financialTrust: 79,
    communityContribution: 91,
  },
  verifiableCredentials: [
    {
      id: 'vc1',
      type: 'Professional Certification',
      issuer: 'TailorsGuild DAO',
      status: 'verified',
      issuedDate: '2024-01-15',
    },
    {
      id: 'vc2',
      type: 'Identity Verification',
      issuer: 'VerifyID',
      status: 'verified',
      issuedDate: '2024-02-01',
    },
    {
      id: 'vc3',
      type: 'Community Badge',
      issuer: 'RIA Protocol',
      status: 'verified',
      issuedDate: '2024-03-10',
    },
  ],
};

const mockIOUs: IOU[] = [
  {
    id: 'iou1',
    type: 'service',
    description: 'Custom suit tailoring with premium wool fabric',
    value: 450,
    issuer: 'user123',
    issuerName: 'Alex Rivera',
    recipient: 'user456',
    recipientName: 'Sarah Chen',
    dueDate: '2024-12-31',
    status: 'outstanding',
    aiRiskScore: 85,
    createdDate: '2024-11-15',
  },
  {
    id: 'iou2',
    type: 'service',
    description: 'Wedding dress alteration and fitting',
    value: 200,
    issuer: 'user789',
    issuerName: 'Maria Santos',
    recipient: 'user123',
    recipientName: 'Alex Rivera',
    dueDate: '2024-12-15',
    status: 'outstanding',
    aiTrustScore: 92,
    createdDate: '2024-11-10',
  },
  {
    id: 'iou3',
    type: 'good',
    description: 'Organic cotton fabric bundle (5 yards)',
    value: 150,
    issuer: 'user123',
    issuerName: 'Alex Rivera',
    recipient: 'user654',
    recipientName: 'David Kim',
    dueDate: '2024-11-30',
    status: 'fulfilled',
    aiRiskScore: 78,
    createdDate: '2024-11-01',
  },
];

const mockAvailableServices: IOU[] = [
  {
    id: 'service1',
    type: 'service',
    description: 'Professional headshot photography session',
    value: 300,
    issuer: 'photographer1',
    issuerName: 'Emma Wilson',
    recipient: '',
    recipientName: '',
    dueDate: '2024-12-20',
    status: 'outstanding',
    aiTrustScore: 88,
    createdDate: '2024-11-18',
  },
  {
    id: 'service2',
    type: 'service',
    description: 'Logo design and branding package',
    value: 500,
    issuer: 'designer1',
    issuerName: 'Marcus Thompson',
    recipient: '',
    recipientName: '',
    dueDate: '2024-12-25',
    status: 'outstanding',
    aiTrustScore: 94,
    createdDate: '2024-11-16',
  },
  {
    id: 'service3',
    type: 'good',
    description: 'Handcrafted leather wallet',
    value: 80,
    issuer: 'crafter1',
    issuerName: 'Oliver Brown',
    recipient: '',
    recipientName: '',
    dueDate: '2024-12-10',
    status: 'outstanding',
    aiTrustScore: 91,
    createdDate: '2024-11-12',
  },
];

const mockProposals: Proposal[] = [
  {
    id: 'prop1',
    title: 'Reduce IOU Minimum Value to $50',
    description: 'Lower the minimum IOU value from $100 to $50 to enable more micro-transactions and community participation.',
    status: 'active',
    votesFor: 142,
    votesAgainst: 38,
    endDate: '2024-12-05',
    proposer: 'Community Member',
  },
  {
    id: 'prop2',
    title: 'Implement Reputation Decay Mechanism',
    description: 'Introduce a gradual reputation decay for inactive users to maintain network quality and encourage participation.',
    status: 'active',
    votesFor: 89,
    votesAgainst: 67,
    endDate: '2024-12-08',
    proposer: 'Core Team',
  },
  {
    id: 'prop3',
    title: 'Add NFT Integration for Credentials',
    description: 'Enable users to mint their verifiable credentials as NFTs for better portability and ownership.',
    status: 'passed',
    votesFor: 203,
    votesAgainst: 45,
    endDate: '2024-11-20',
    proposer: 'Tech Committee',
  },
];

const mockRecentActivity = [
  { id: 1, type: 'iou_fulfilled', description: 'Sarah Chen confirmed receipt of custom suit', timestamp: '2 hours ago' },
  { id: 2, type: 'reputation_increased', description: 'Reputation increased by 5 points', timestamp: '1 day ago' },
  { id: 3, type: 'vc_issued', description: 'New community badge earned', timestamp: '3 days ago' },
  { id: 4, type: 'iou_issued', description: 'New IOU issued to David Kim', timestamp: '5 days ago' },
];

const RIAProtocolDApp: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // Modal states
  const [isIssueIOUModalOpen, setIsIssueIOUModalOpen] = useState<boolean>(false);
  const [isAcceptIOUModalOpen, setIsAcceptIOUModalOpen] = useState<boolean>(false);
  const [isFulfillIOUModalOpen, setIsFulfillIOUModalOpen] = useState<boolean>(false);
  const [selectedIOU, setSelectedIOU] = useState<IOU | null>(null);
  
  // Form states
  const [newIOU, setNewIOU] = useState({
    type: '',
    description: '',
    value: '',
    recipientDID: '',
    recipientName: '',
    dueDate: '',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiRiskScore, setAiRiskScore] = useState<number | null>(null);
  const [isGettingRiskScore, setIsGettingRiskScore] = useState<boolean>(false);
  const [isGettingInsight, setIsGettingInsight] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isEnhancingDescription, setIsEnhancingDescription] = useState<boolean>(false);

  // Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setUserId(user.uid);
        
        // Update user data in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            lastLogin: new Date().toISOString(),
            userId: user.uid,
          }, { merge: true });
        } catch (error) {
          console.error('Error updating user document:', error);
        }
      } else {
        // Sign in anonymously if no user
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Error signing in anonymously:', error);
          setUserId('anonymous-' + Math.random().toString(36).substr(2, 9));
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Wallet connection simulation
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gemini API integration
  const callGeminiAPI = async (prompt: string): Promise<string> => {
    const apiKey = ""; // API key will be injected by Canvas
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  // AI functions
  const getAIReputationInsight = async () => {
    setIsGettingInsight(true);
    try {
      const prompt = `Analyze this user's reputation profile and provide actionable insights:
      
      Overall Reputation: ${mockUser.reputationBreakdown.overall}/100
      Tailoring: ${mockUser.reputationBreakdown.tailoring}/100
      Punctuality: ${mockUser.reputationBreakdown.punctuality}/100
      Financial Trust: ${mockUser.reputationBreakdown.financialTrust}/100
      Community Contribution: ${mockUser.reputationBreakdown.communityContribution}/100
      
      Verifiable Credentials: ${mockUser.verifiableCredentials.length} verified credentials
      
      Provide a brief, actionable analysis focusing on strengths and areas for improvement.`;
      
      const insight = await callGeminiAPI(prompt);
      setAiInsight(insight);
    } catch (error) {
      toast({
        title: "AI Analysis Failed",
        description: "Unable to generate reputation insight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGettingInsight(false);
    }
  };

  const enhanceDescription = async () => {
    if (!newIOU.description.trim()) {
      toast({
        title: "No Description",
        description: "Please enter a description first.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancingDescription(true);
    try {
      const prompt = `Enhance this IOU service/good description to be more professional and detailed:
      
      Original: "${newIOU.description}"
      
      Provide an enhanced version that is clear, professional, and includes relevant details that would help build trust between parties.`;
      
      const enhanced = await callGeminiAPI(prompt);
      setNewIOU(prev => ({ ...prev, description: enhanced }));
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "Unable to enhance description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancingDescription(false);
    }
  };

  const getAIRiskScore = async () => {
    setIsGettingRiskScore(true);
    try {
      // Simulate AI risk assessment
      await new Promise(resolve => setTimeout(resolve, 1500));
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-99
      setAiRiskScore(score);
      toast({
        title: "AI Risk Score Generated",
        description: `Risk assessment complete: ${score}% confidence`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Risk Assessment Failed",
        description: "Unable to generate risk score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGettingRiskScore(false);
    }
  };

  // Transaction simulation functions
  const simulateTransaction = async (action: string) => {
    toast({
      title: "Transaction Pending",
      description: "Processing blockchain transaction...",
      variant: "default",
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Transaction Confirmed",
      description: `${action} completed successfully!`,
      variant: "default",
    });
  };

  // IOU management functions
  const issueIOU = async () => {
    if (!newIOU.type || !newIOU.description || !newIOU.value || !newIOU.recipientDID || !newIOU.recipientName || !newIOU.dueDate || !aiRiskScore) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all fields and get AI risk score.",
        variant: "destructive",
      });
      return;
    }

    await simulateTransaction("IOU issuance");
    setIsIssueIOUModalOpen(false);
    setNewIOU({ type: '', description: '', value: '', recipientDID: '', recipientName: '', dueDate: '' });
    setAiRiskScore(null);
  };

  const acceptIOU = async () => {
    if (!selectedIOU) return;
    await simulateTransaction("IOU acceptance");
    setIsAcceptIOUModalOpen(false);
    setSelectedIOU(null);
  };

  const fulfillIOU = async () => {
    if (!selectedIOU) return;
    await simulateTransaction("IOU fulfillment");
    setIsFulfillIOUModalOpen(false);
    setSelectedIOU(null);
  };

  const voteOnProposal = async (proposalId: string, vote: 'for' | 'against') => {
    await simulateTransaction(`Vote ${vote} on proposal`);
  };

  // Utility functions
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'outstanding': return 'warning';
      case 'fulfilled': return 'success';
      case 'accepted': return 'success';
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'destructive';
      case 'active': return 'trust';
      case 'passed': return 'success';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-trust-start';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const filteredServices = mockAvailableServices.filter(service =>
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.issuerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-start mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading RIA Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="glass border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-trust-start" />
                <h1 className="text-2xl font-bold bg-gradient-trust bg-clip-text text-transparent">
                  RIA Protocol
                </h1>
              </div>
              <Badge variant="outline" className="text-xs">
                Alpha v0.1
              </Badge>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'dashboard' ? 'text-trust-start' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'profile' ? 'text-trust-start' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Profile
              </button>
              <button
                onClick={() => setCurrentView('ious')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'ious' ? 'text-trust-start' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                IOUs
              </button>
              <button
                onClick={() => setCurrentView('discover')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'discover' ? 'text-trust-start' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setCurrentView('governance')}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'governance' ? 'text-trust-start' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Governance
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-xs font-mono">{userId || 'Loading...'}</p>
              </div>
              {isWalletConnected ? (
                <Badge variant="success" className="font-mono">
                  {formatAddress(walletAddress)}
                </Badge>
              ) : (
                <Button onClick={connectWallet} variant="trust" size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Welcome to RIA Protocol</h2>
              <p className="text-muted-foreground">Decentralized reputation and trust network</p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="gradient-card shadow-card hover:shadow-glow transition-smooth">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Reputation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Award className="h-8 w-8 text-trust-start" />
                    <div>
                      <div className="text-2xl font-bold">{mockUser.overallReputation}</div>
                      <p className="text-xs text-muted-foreground">+15 this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card shadow-card hover:shadow-glow transition-smooth">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">$RIA Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-success" />
                    <div>
                      <div className="text-2xl font-bold">{mockUser.riaBalance}</div>
                      <p className="text-xs text-muted-foreground">+120 this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card shadow-card hover:shadow-glow transition-smooth">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active IOUs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-warning" />
                    <div>
                      <div className="text-2xl font-bold">{mockIOUs.filter(iou => iou.status === 'outstanding').length}</div>
                      <p className="text-xs text-muted-foreground">2 expiring soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get you started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setIsIssueIOUModalOpen(true)}
                    variant="trust"
                    className="h-20 flex-col"
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Issue IOU
                  </Button>
                  <Button
                    onClick={() => setCurrentView('ious')}
                    variant="ghost"
                    className="h-20 flex-col border-2 border-dashed border-border"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    View IOUs
                  </Button>
                  <Button
                    onClick={() => setCurrentView('discover')}
                    variant="ghost"
                    className="h-20 flex-col border-2 border-dashed border-border"
                  >
                    <Search className="h-6 w-6 mb-2" />
                    Explore Services
                  </Button>
                  <Button
                    onClick={() => setCurrentView('governance')}
                    variant="ghost"
                    className="h-20 flex-col border-2 border-dashed border-border"
                  >
                    <Vote className="h-6 w-6 mb-2" />
                    Vote on Proposals
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions on the network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background-secondary/50">
                      <div className="h-2 w-2 bg-trust-start rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile View */}
        {currentView === 'profile' && (
          <div className="space-y-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your decentralized identity and reputation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  <img
                    src={mockUser.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-trust-start/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{mockUser.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-trust-start" />
                        <span className="font-mono text-muted-foreground">DID:</span>
                        <span className="font-mono">{mockUser.did}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <UserIcon className="h-4 w-4 text-trust-start" />
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono">{userId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reputation Breakdown */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Reputation Breakdown</CardTitle>
                <CardDescription>Multi-dimensional trust scores across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(mockUser.reputationBreakdown).map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold">{score}/100</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Reputation Insight */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-trust-start" />
                  <span>AI Reputation Insight</span>
                </CardTitle>
                <CardDescription>Get personalized analysis of your reputation profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={getAIReputationInsight}
                    disabled={isGettingInsight}
                    variant="trust"
                    className="w-full"
                  >
                    {isGettingInsight ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Reputation Insight ✨
                      </>
                    )}
                  </Button>
                  
                  {aiInsight && (
                    <div className="p-4 bg-background-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2">AI Analysis:</h4>
                      <p className="text-sm leading-relaxed">{aiInsight}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verifiable Credentials */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Verifiable Credentials</CardTitle>
                <CardDescription>Your verified achievements and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockUser.verifiableCredentials.map((vc) => (
                    <div key={vc.id} className="p-4 border rounded-lg bg-gradient-card">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{vc.type}</h4>
                        <Badge variant={getStatusBadgeVariant(vc.status)}>
                          {vc.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Issued by: {vc.issuer}</p>
                      <p className="text-xs text-muted-foreground">Date: {vc.issuedDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* IOUs View */}
        {currentView === 'ious' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">IOU Management</h2>
                <p className="text-muted-foreground">Manage your issued and received IOUs</p>
              </div>
              <Button onClick={() => setIsIssueIOUModalOpen(true)} variant="trust">
                <Plus className="h-4 w-4 mr-2" />
                Issue New IOU
              </Button>
            </div>

            {/* IOUs Issued by User */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>IOUs You've Issued</CardTitle>
                <CardDescription>Services and goods you've promised to deliver</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockIOUs
                    .filter(iou => iou.issuer === mockUser.id)
                    .map((iou) => (
                      <div key={iou.id} className="p-4 border rounded-lg bg-gradient-card">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{iou.description}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>To: {iou.recipientName}</span>
                              <span>Value: ${iou.value}</span>
                              <span>Due: {iou.dueDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(iou.status)}>
                              {iou.status}
                            </Badge>
                            {iou.aiRiskScore && (
                              <Badge variant="outline" className="text-xs">
                                Risk: {iou.aiRiskScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {iou.status === 'outstanding' && (
                          <Button
                            onClick={() => {
                              setSelectedIOU(iou);
                              setIsFulfillIOUModalOpen(true);
                            }}
                            variant="success"
                            size="sm"
                          >
                            Mark as Fulfilled
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* IOUs Received by User */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>IOUs You've Received</CardTitle>
                <CardDescription>Services and goods others have promised to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockIOUs
                    .filter(iou => iou.recipient === mockUser.id)
                    .map((iou) => (
                      <div key={iou.id} className="p-4 border rounded-lg bg-gradient-card">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{iou.description}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>From: {iou.issuerName}</span>
                              <span>Value: ${iou.value}</span>
                              <span>Due: {iou.dueDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(iou.status)}>
                              {iou.status}
                            </Badge>
                            {iou.aiTrustScore && (
                              <Badge variant="outline" className={`text-xs ${getTrustScoreColor(iou.aiTrustScore)}`}>
                                Trust: {iou.aiTrustScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {iou.status === 'outstanding' && (
                          <Button
                            onClick={() => {
                              setSelectedIOU(iou);
                              setIsAcceptIOUModalOpen(true);
                            }}
                            variant="trust"
                            size="sm"
                          >
                            Accept IOU
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Discover Services View */}
        {currentView === 'discover' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Discover Services</h2>
              <p className="text-muted-foreground">Find services and goods offered by the community</p>
            </div>

            {/* Search */}
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services, goods, or providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="shadow-card hover:shadow-glow transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{service.description}</CardTitle>
                      <Badge variant="outline" className="text-xs shrink-0 ml-2">
                        {service.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Offered by:</span>
                        <span className="text-sm font-medium">{service.issuerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="text-lg font-bold text-success">${service.value}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Due Date:</span>
                        <span className="text-sm">{service.dueDate}</span>
                      </div>
                      {service.aiTrustScore && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">AI Trust Score:</span>
                          <Badge variant="outline" className={getTrustScoreColor(service.aiTrustScore)}>
                            {service.aiTrustScore}%
                          </Badge>
                        </div>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedIOU(service);
                          setIsAcceptIOUModalOpen(true);
                        }}
                        variant="trust"
                        className="w-full"
                      >
                        Accept IOU
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Governance View */}
        {currentView === 'governance' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">DAO Governance</h2>
              <p className="text-muted-foreground">Participate in protocol governance and decision making</p>
            </div>

            {/* Active Proposals */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Active Proposals</CardTitle>
                <CardDescription>Vote on current proposals to shape the protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockProposals
                    .filter(proposal => proposal.status === 'active')
                    .map((proposal) => (
                      <div key={proposal.id} className="p-6 border rounded-lg bg-gradient-card">
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold mb-2">{proposal.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Proposed by: {proposal.proposer}</span>
                            <span>Ends: {proposal.endDate}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Votes For: {proposal.votesFor}</span>
                            <span className="text-sm">Votes Against: {proposal.votesAgainst}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-success h-2 rounded-full"
                              style={{
                                width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => voteOnProposal(proposal.id, 'for')}
                            variant="success"
                            size="sm"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Vote For
                          </Button>
                          <Button
                            onClick={() => voteOnProposal(proposal.id, 'against')}
                            variant="destructive"
                            size="sm"
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Vote Against
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Past Proposals */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Past Proposals</CardTitle>
                <CardDescription>Previous governance decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProposals
                    .filter(proposal => proposal.status !== 'active')
                    .map((proposal) => (
                      <div key={proposal.id} className="p-4 border rounded-lg bg-background-secondary/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{proposal.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{proposal.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>For: {proposal.votesFor}</span>
                              <span>Against: {proposal.votesAgainst}</span>
                              <span>Ended: {proposal.endDate}</span>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(proposal.status)}>
                            {proposal.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Issue IOU Modal */}
      <Dialog open={isIssueIOUModalOpen} onOpenChange={setIsIssueIOUModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue New IOU</DialogTitle>
            <DialogDescription>
              Create a new IOU to promise a service or good to another user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iou-type">IOU Type</Label>
                <Select value={newIOU.type} onValueChange={(value) => setNewIOU(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="iou-value">Estimated Value ($RIA)</Label>
                <Input
                  id="iou-value"
                  type="number"
                  placeholder="0"
                  value={newIOU.value}
                  onChange={(e) => setNewIOU(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="iou-description">Service/Good Description</Label>
                <Button
                  onClick={enhanceDescription}
                  disabled={isEnhancingDescription || !newIOU.description.trim()}
                  variant="outline"
                  size="sm"
                >
                  {isEnhancingDescription ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-2" />
                      ✨ Enhance
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="iou-description"
                placeholder="Describe what you will provide..."
                value={newIOU.description}
                onChange={(e) => setNewIOU(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient-did">Recipient DID</Label>
                <Input
                  id="recipient-did"
                  placeholder="did:ria:0x..."
                  value={newIOU.recipientDID}
                  onChange={(e) => setNewIOU(prev => ({ ...prev, recipientDID: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input
                  id="recipient-name"
                  placeholder="Enter recipient name"
                  value={newIOU.recipientName}
                  onChange={(e) => setNewIOU(prev => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={newIOU.dueDate}
                onChange={(e) => setNewIOU(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={getAIRiskScore}
                disabled={isGettingRiskScore}
                variant="trust"
                className="w-full"
              >
                {isGettingRiskScore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Risk...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Risk Score ✨
                  </>
                )}
              </Button>
              
              {aiRiskScore && (
                <div className="p-4 bg-background-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Risk Assessment:</span>
                    <Badge variant="outline" className={getTrustScoreColor(aiRiskScore)}>
                      {aiRiskScore}% Confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This score is verifiable on-chain via ZKP
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={issueIOU}
                disabled={!newIOU.type || !newIOU.description || !newIOU.value || !newIOU.recipientDID || !newIOU.recipientName || !newIOU.dueDate || !aiRiskScore}
                variant="trust"
                className="flex-1"
              >
                Issue IOU
              </Button>
              <Button onClick={() => setIsIssueIOUModalOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept IOU Modal */}
      <Dialog open={isAcceptIOUModalOpen} onOpenChange={setIsAcceptIOUModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept IOU</DialogTitle>
            <DialogDescription>
              Review the IOU details before accepting
            </DialogDescription>
          </DialogHeader>
          
          {selectedIOU && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gradient-card">
                <h4 className="font-semibold mb-2">{selectedIOU.description}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold">${selectedIOU.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From:</span>
                    <span>{selectedIOU.issuerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{selectedIOU.dueDate}</span>
                  </div>
                  {selectedIOU.aiTrustScore && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Trust Score:</span>
                      <Badge variant="outline" className={getTrustScoreColor(selectedIOU.aiTrustScore)}>
                        {selectedIOU.aiTrustScore}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={acceptIOU} variant="trust" className="flex-1">
                  Confirm Acceptance
                </Button>
                <Button onClick={() => setIsAcceptIOUModalOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fulfill IOU Modal */}
      <Dialog open={isFulfillIOUModalOpen} onOpenChange={setIsFulfillIOUModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfill IOU</DialogTitle>
            <DialogDescription>
              Mark this IOU as fulfilled after completing the service/delivery
            </DialogDescription>
          </DialogHeader>
          
          {selectedIOU && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gradient-card">
                <h4 className="font-semibold mb-2">{selectedIOU.description}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold">${selectedIOU.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient:</span>
                    <span>{selectedIOU.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{selectedIOU.dueDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={fulfillIOU} variant="success" className="flex-1">
                  Confirm Fulfillment
                </Button>
                <Button onClick={() => setIsFulfillIOUModalOpen(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RIAProtocolDApp;
