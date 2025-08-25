

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Map,
  MessageSquare,
  MousePointerClick,
  Search,
  Star,
  Target,
  Trophy,
  AlertTriangle,
  Phone,
  MapPin,
  ExternalLink,
  FileText,
  Ticket,
  PhoneIncoming,
  PhoneOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { reviews } from "@/lib/mock-data";

const chartData = [
  { month: "January", positive: 186, negative: 80 },
  { month: "February", positive: 305, negative: 200 },
  { month: "March", positive: 237, negative: 120 },
  { month: "April", positive: 73, negative: 190 },
  { month: "May", positive: 209, negative: 130 },
  { month: "June", positive: 214, negative: 140 },
]

const chartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(var(--primary))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--destructive))",
  },
}

// Calculate the average rating from the mock reviews data
const calculateAverageRating = (reviews: typeof reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / reviews.length);
}

// Data points for calculating the local visibility score
const storeMetrics = {
  gmb: {
    profileCompletion: 85, // out of 100
    postsLast30Days: 3, // target is 4+
    photosCount: 15, // target is 10+
    questionsAnswered: 8, // target is 10+
    impressionsLast30Days: 143000,
    ctr: 3.6, // percentage
  },
  reviews: {
    averageRating: calculateAverageRating(reviews), // out of 5
    totalReviews: reviews.length,
    newReviewsLast30Days: 15, // This now drives the "Total Reviews This Month" card
    responseRate: 90, // out of 100
  },
  microsite: {
    hasTitle: true,
    hasDescription: true,
    hasH1: true,
    hasSchema: true,
    imageAltTagsCoverage: 95, // out of 100
  },
  keywords: {
    averageRank: 3.2, // target is < 5
  },
};

function calculateVisibilityScore(metrics: typeof storeMetrics) {
    // GMB Profile Strength (40%)
    const gmbCompletenessScore = metrics.gmb.profileCompletion;
    const gmbPostScore = Math.min(metrics.gmb.postsLast30Days / 4, 1) * 100;
    const gmbPhotoScore = Math.min(metrics.gmb.photosCount / 10, 1) * 100;
    const gmbQAScore = Math.min(metrics.gmb.questionsAnswered / 10, 1) * 100;
    const gmbStrength = (gmbCompletenessScore * 0.4) + (gmbPostScore * 0.3) + (gmbPhotoScore * 0.2) + (gmbQAScore * 0.1);

    // Review Performance (30%)
    const ratingScore = (metrics.reviews.averageRating / 5) * 100;
    const volumeScore = Math.min(metrics.reviews.totalReviews / 500, 1) * 100;
    const recencyScore = Math.min(metrics.reviews.newReviewsLast30Days / 50, 1) * 100;
    const responseScore = metrics.reviews.responseRate;
    const reviewPerformance = (ratingScore * 0.4) + (volumeScore * 0.2) + (recencyScore * 0.2) + (responseScore * 0.2);

    // Microsite SEO Health (20%)
    const seoChecks = [metrics.microsite.hasTitle, metrics.microsite.hasDescription, metrics.microsite.hasH1, metrics.microsite.hasSchema];
    const seoBasicsScore = (seoChecks.filter(Boolean).length / seoChecks.length) * 100;
    const seoHealth = (seoBasicsScore * 0.6) + (metrics.microsite.imageAltTagsCoverage * 0.4);

    // Keyword Ranking (10%)
    // Lower rank is better. Score is inverted. A rank of 1 is 100, a rank of 10+ is 0.
    const keywordRankScore = Math.max(0, (10 - metrics.keywords.averageRank) / 9) * 100;
    
    // Final Weighted Score
    const finalScore = (gmbStrength * 0.4) + (reviewPerformance * 0.3) + (seoHealth * 0.2) + (keywordRankScore * 0.1);

    return Math.round(finalScore);
}

export default function DashboardPage() {
  const visibilityScore = calculateVisibilityScore(storeMetrics);
  const averageRating = calculateAverageRating(reviews);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Visibility Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visibilityScore}/100</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Rating (All Stores)
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">{averageRating.toFixed(1)} <Star className="h-5 w-5 ml-1 text-yellow-400 fill-yellow-400" /></div>
            <p className="text-xs text-muted-foreground">+0.1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews This Month</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeMetrics.reviews.newReviewsLast30Days}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR (GMB → Microsite)</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeMetrics.gmb.ctr}%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GMB Impressions (30d)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeMetrics.gmb.impressionsLast30Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Keywords Tracked</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">cake shop near me</Badge>
                <Badge variant="secondary">anand sweets bangalore</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Conversion Metrics (30d)</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Calls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">892</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <PhoneIncoming className="h-3 w-3 text-green-500"/>
                            <span>Answered</span>
                        </div>
                        <span>780</span>
                    </div>
                     <div className="flex justify-between text-sm mt-1">
                        <div className="flex items-center gap-2">
                            <PhoneOff className="h-3 w-3 text-red-500"/>
                            <span>Missed</span>
                        </div>
                        <span>112</span>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" /> Website Clicks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">2,345</div>
                    <p className="text-xs text-muted-foreground">+8.3% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Form Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">189</div>
                    <p className="text-xs text-muted-foreground">+22% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Ticket className="h-4 w-4" /> Offer Clicks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">45</div>
                    <p className="text-xs text-muted-foreground">New offer launched</p>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    <CardTitle>GMB Visibility Heatmap</CardTitle>
                </div>
                <CardDescription>A heatmap showing GMB search impressions across your locations.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                       <Image src="https://placehold.co/800x400.png" alt="Map placeholder" width={800} height={400} className="rounded-md object-cover" data-ai-hint="world map" />
                  </div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle>Top 5 Performing Stores</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Store</TableHead>
                              <TableHead className="text-right">Score</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          <TableRow>
                              <TableCell>
                                  <div className="font-medium">Downtown</div>
                                  <div className="text-sm text-muted-foreground">New York, NY</div>
                              </TableCell>
                              <TableCell className="text-right">98</TableCell>
                              <TableCell className="text-right text-green-600 flex justify-end items-center gap-1">
                                  <ArrowUp className="h-3 w-3"/> +5%
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell>
                                  <div className="font-medium">Uptown</div>
                                  <div className="text-sm text-muted-foreground">New York, NY</div>
                              </TableCell>
                              <TableCell className="text-right">95</TableCell>
                              <TableCell className="text-right text-green-600 flex justify-end items-center gap-1">
                                  <ArrowUp className="h-3 w-3"/> +3%
                              </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                                <div className="font-medium">Beacon Hill</div>
                                <div className="text-sm text-muted-foreground">Boston, MA</div>
                            </TableCell>
                            <TableCell className="text-right">91</TableCell>
                            <TableCell className="text-right text-green-600 flex justify-end items-center gap-1">
                                <ArrowUp className="h-3 w-3"/> +4%
                            </TableCell>
                           </TableRow>
                           <TableRow>
                            <TableCell>
                                <div className="font-medium">River North</div>
                                <div className="text-sm text-muted-foreground">Chicago, IL</div>
                            </TableCell>
                            <TableCell className="text-right">89</TableCell>
                            <TableCell className="text-right text-green-600 flex justify-end items-center gap-1">
                                <ArrowUp className="h-3 w-3"/> +2%
                            </TableCell>
                           </TableRow>
                           <TableRow>
                            <TableCell>
                                <div className="font-medium">Midtown</div>
                                <div className="text-sm text-muted-foreground">New York, NY</div>
                            </TableCell>
                            <TableCell className="text-right">88</TableCell>
                            <TableCell className="text-right text-green-600 flex justify-end items-center gap-1">
                                <ArrowUp className="h-3 w-3"/> +1.5%
                            </TableCell>
                           </TableRow>
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Bottom 5 Underperforming Stores</CardTitle>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Store</TableHead>
                              <TableHead className="text-right">Score</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          <TableRow>
                            <TableCell>
                                <div className="font-medium">South Beach</div>
                                <div className="text-sm text-muted-foreground">Miami, FL</div>
                            </TableCell>
                            <TableCell className="text-right">62</TableCell>
                            <TableCell className="text-right text-red-600 flex justify-end items-center gap-1">
                                <ArrowDown className="h-3 w-3"/> -8%
                            </TableCell>
                           </TableRow>
                           <TableRow>
                            <TableCell>
                                <div className="font-medium">Westwood</div>
                                <div className="text-sm text-muted-foreground">Los Angeles, CA</div>
                            </TableCell>
                            <TableCell className="text-right">68</TableCell>
                            <TableCell className="text-right text-red-600 flex justify-end items-center gap-1">
                                <ArrowDown className="h-3 w-3"/> -5%
                            </TableCell>
                           </TableRow>
                           <TableRow>
                            <TableCell>
                                <div className="font-medium">The Loop</div>
                                <div className="text-sm text-muted-foreground">Chicago, IL</div>
                            </TableCell>
                            <TableCell className="text-right">71</TableCell>
                            <TableCell className="text-right text-red-600 flex justify-end items-center gap-1">
                                <ArrowDown className="h-3 w-3"/> -3%
                            </TableCell>
                           </TableRow>
                            <TableRow>
                            <TableCell>
                                <div className="font-medium">Fremont</div>
                                <div className="text-sm text-muted-foreground">Seattle, WA</div>
                            </TableCell>
                            <TableCell className="text-right">73</TableCell>
                            <TableCell className="text-right text-red-600 flex justify-end items-center gap-1">
                                <ArrowDown className="h-3 w-3"/> -2.5%
                            </TableCell>
                           </TableRow>
                           <TableRow>
                            <TableCell>
                                <div className="font-medium">Downtown</div>
                                <div className="text-sm text-muted-foreground">Houston, TX</div>
                            </TableCell>
                            <TableCell className="text-right">75</TableCell>
                            <TableCell className="text-right text-red-600 flex justify-end items-center gap-1">
                                <ArrowDown className="h-3 w-3"/> -1%
                            </TableCell>
                           </TableRow>
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Sentiment Trends</CardTitle>
          <CardDescription>
            Positive vs. negative review sentiment over the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="negative"
                type="natural"
                fill="var(--color-negative)"
                fillOpacity={0.4}
                stroke="var(--color-negative)"
                stackId="a"
              />
              <Area
                dataKey="positive"
                type="natural"
                fill="var(--color-positive)"
                fillOpacity={0.4}
                stroke="var(--color-positive)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
