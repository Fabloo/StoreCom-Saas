import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RankTrackerPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Rank Tracker</CardTitle>
                <CardDescription>Monitor local pack rank and keyword performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Rank tracking and keyword insights will be displayed here.</p>
                </div>
            </CardContent>
        </Card>
    )
}
