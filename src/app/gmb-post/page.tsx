
'use client'

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Calendar, RefreshCw, MessageSquare, Flame, ExternalLink } from "lucide-react";
import { analyzeReviewSentiment } from "@/ai/flows/analyze-review-sentiment";

const sampleReviews = [
  "Absolutely fantastic service! The plumber arrived on time and fixed the issue quickly. Highly recommended.",
  "Good service overall, but a bit pricey compared to others.",
  "Loved the new coffee blend! So fresh.",
  "The technician was late and didn't seem to know what he was doing.",
  "The store was not clean and the staff was rude. A very bad experience."
];

const postIdeas = [
  "Highlight our 24/7 emergency service.",
  "Feature a 'Meet the Technician' post.",
  "Run a special offer on drain cleaning.",
  "Share a customer testimonial about our quick response time.",
];

export default function GmbPostPage() {
    const [topKeywords, setTopKeywords] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const extractKeywords = React.useCallback(async () => {
        setIsLoading(true);
        const keywordCounts: Record<string, number> = {};

        // This is a simplified keyword extraction logic.
        // A real implementation would use a more sophisticated NLP model or flow.
        const commonWords = new Set(['the', 'a', 'an', 'is', 'was', 'were', 'and', 'but', 'for', 'at', 'in', 'on', 'to', 'it', 'i']);
        
        for (const reviewText of sampleReviews) {
            const words = reviewText.toLowerCase().replace(/[.,!]/g, '').split(/\s+/);
            for (const word of words) {
                if (!commonWords.has(word) && word.length > 3) {
                    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                }
            }
        }
        
        const sortedKeywords = Object.entries(keywordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);

        setTopKeywords(sortedKeywords);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        extractKeywords();
    }, [extractKeywords]);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>GMB Post Optimization</CardTitle>
                        <CardDescription>Track posting frequency and get AI-powered ideas for your next GMB post.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base font-medium">Posting Frequency</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">3 Posts</div>
                                <p className="text-xs text-muted-foreground">in the last 30 days</p>
                                <Separator className="my-4" />
                                <div className="flex items-center justify-between">
                                    <div className='text-sm'>
                                        <p>You're on a good track! Aim for at least one post per week to maximize visibility.</p>
                                    </div>
                                    <Button onClick={() => window.location.href = '/google-business'}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Go to Google Business
                        </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base font-medium">Post Ideas from Reviews</CardTitle>
                                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    {postIdeas.map((idea, index) => (
                                        <li key={index}>{idea}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                         <CardTitle className="text-base font-medium">Top Keywords from Reviews</CardTitle>
                         <CardDescription>Words frequently mentioned by your customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground">Analyzing reviews...</p>
                            ) : (
                                topKeywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                                ))
                            )}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={extractKeywords} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Keywords
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
