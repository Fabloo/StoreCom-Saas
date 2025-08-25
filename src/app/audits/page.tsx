
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  CheckCircle,
  ChevronRight,
  FileText,
  HelpCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { suggestSeoFixes, SuggestSeoFixesInput } from '@/ai/flows/suggest-seo-fixes';
import { cn } from '@/lib/utils';

const stores = [
  {
    id: 'downtown-branch',
    name: 'Downtown Branch',
    location: 'New York, NY',
    score: 92,
    lastAudit: '2024-07-22',
    status: 'Good',
    seoData: {
      title: 'Best Coffee in Downtown NYC | Downtown Branch',
      description: 'Visit Downtown Branch for the best artisanal coffee, pastries, and sandwiches in New York. Located in the heart of downtown.',
      h1: 'Welcome to Downtown Branch',
      imageAlts: ['A cup of coffee', 'Our storefront'],
      schema: ['LocalBusiness', 'Product'],
    }
  },
  {
    id: 'westwood-store',
    name: 'Westwood Store',
    location: 'Los Angeles, CA',
    score: 68,
    lastAudit: '2024-07-21',
    status: 'Needs Improvement',
     seoData: {
      title: 'Westwood Store',
      description: '',
      h1: 'Home',
      imageAlts: ['img-123.jpg', 'logo'],
      schema: [],
    }
  },
  {
    id: 'river-north',
    name: 'River North',
    location: 'Chicago, IL',
    score: 85,
    lastAudit: '2024-07-22',
    status: 'Good',
     seoData: {
      title: 'River North - Bakes & Brews',
      description: 'Your local spot for coffee and cakes in Chicago. We are located in River North. Open daily from 7am to 7pm.',
      h1: 'River North',
      imageAlts: ['Coffee shop interior', 'A slice of cake'],
      schema: ['LocalBusiness'],
    }
  },
  {
    id: 'south-beach',
    name: 'South Beach',
    location: 'Miami, FL',
    score: 55,
    lastAudit: '2024-07-20',
    status: 'Poor',
     seoData: {
      title: 'South Beach',
      description: 'A coffee shop.',
      h1: '',
      imageAlts: [],
      schema: [],
    }
  },
];

const auditDetails = [
  { check: 'Meta Title', description: 'The title tag is present, within the recommended length (50-60 characters), and contains primary keywords.', status: 'pass' },
  { check: 'Meta Description', description: 'The meta description is present and within the recommended length (150-160 characters).', status: 'pass' },
  { check: 'H1 Tag', description: 'Exactly one H1 tag is present on the page.', status: 'fail', suggestion: 'The H1 tag is missing. Add a unique H1 tag that describes the page content.' },
  { check: 'Image ALT Attributes', description: 'All important images have descriptive ALT attributes.', status: 'warn', suggestion: '2 out of 5 images are missing ALT attributes. Add descriptive text to improve accessibility and image SEO.' },
  { check: 'LocalBusiness Schema', description: 'Valid LocalBusiness schema is implemented.', status: 'pass' },
  { check: 'FAQ Schema', description: 'FAQ schema is present on pages with Q&A content.', status: 'pass' },
  { check: 'Mobile Friendliness', description: 'The page is responsive and displays well on mobile devices.', status: 'pass' },
];

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-600';
}

function getStatusBadge(status: string) {
    if (status === 'pass') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'warn') return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    if (status === 'fail') return <XCircle className="h-5 w-5 text-red-500" />;
    return null;
}

function AISuggestionButton({ seoData }: { seoData: SuggestSeoFixesInput }) {
    const [suggestions, setSuggestions] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await suggestSeoFixes(seoData);
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to get AI suggestions", error);
            setSuggestions({ error: "Failed to generate suggestions. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Bot className="mr-2 h-4 w-4" />Get AI Suggestions</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>AI-Powered SEO Fixes</DialogTitle>
                    <DialogDescription>
                        Here are AI-generated suggestions to improve this store's SEO based on its current data.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    {!suggestions && !isLoading && (
                         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Ready to improve?</h3>
                            <p className="text-sm text-muted-foreground mb-4">Click the button below to generate suggestions.</p>
                            <Button onClick={handleGenerate}>
                                <Bot className="mr-2 h-4 w-4" /> Generate Suggestions
                            </Button>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-4">Analyzing and generating suggestions...</p>
                        </div>
                    )}
                    {suggestions && !isLoading && (
                        <div className="space-y-4 text-sm">
                            {suggestions.error ? <p className="text-red-500">{suggestions.error}</p> : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold">Suggested Meta Title</h4>
                                        <p className="mt-1 p-2 bg-muted rounded-md font-mono text-xs">{suggestions.suggestedTitle}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Suggested Meta Description</h4>
                                        <p className="mt-1 p-2 bg-muted rounded-md">{suggestions.suggestedDescription}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Suggested Keywords</h4>
                                        <p className="mt-1 p-2 bg-muted rounded-md">{suggestions.suggestedKeywords}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AuditDetailDialog({ store }: { store: (typeof stores)[0] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" /> View Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>SEO Audit Report: {store.name}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of SEO factors and recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Overall Score</CardDescription>
                        <CardTitle className={cn("text-4xl", getScoreColor(store.score))}>{store.score}/100</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={store.score} />
                    </CardContent>
                </Card>
                <AISuggestionButton seoData={store.seoData} />
            </div>
            <div className="md:col-span-2">
                <div className="border rounded-lg">
                    {auditDetails.map((item, index) => (
                    <Collapsible key={index} className="border-b last:border-b-0">
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                {getStatusBadge(item.status)}
                                <span>{item.check}</span>
                            </div>
                           <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                        <div className="px-3 pb-3 pl-11 text-muted-foreground text-xs space-y-2">
                          <p>{item.description}</p>
                          {item.suggestion && <p className="mt-1 text-foreground bg-muted p-2 rounded-md"><b>Suggestion:</b> {item.suggestion}</p>}
                        </div>
                        </CollapsibleContent>
                    </Collapsible>
                    ))}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Audits</CardTitle>
        <CardDescription>
          Review SEO completeness and get fix suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>SEO Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Audited</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>
                  <div className="font-medium">{store.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {store.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn('font-semibold', getScoreColor(store.score))}>
                    {store.score}/100
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={store.score < 70 ? 'destructive' : store.score < 90 ? 'secondary' : 'default'}>
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{store.lastAudit}</TableCell>
                <TableCell className="text-right">
                  <AuditDetailDialog store={store} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
