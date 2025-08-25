
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

// In a real app, you would fetch the brand and its stores based on the brandSlug
const brandData = {
    name: "Haldiram's",
    slug: "haldirams",
    stores: [
        { name: "Gurugram, Sector 14", slug: "gurugram-sector-14" },
        { name: "Connaught Place, Delhi", slug: "connaught-place-delhi" },
        { name: "Mall of India, Noida", slug: "mall-of-india-noida" },
    ]
}

const pizzaBrandData = {
    name: "Pizza House",
    slug: "pizza-house",
    stores: [
        { name: "Downtown", slug: "downtown" },
        { name: "River North", slug: "river-north" },
        { name: "Wicker Park", slug: "wicker-park" },
    ]
}


export default function BrandPage({ params }: { params: { brandSlug: string } }) {
    const data = params.brandSlug === 'pizza-house' ? pizzaBrandData : brandData;

    return (
        <div className="container mx-auto py-12 px-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Welcome to {data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <h2 className="text-lg font-semibold mb-4 text-center text-muted-foreground">Our Locations</h2>
                    <div className="space-y-3">
                        {data.stores.map(store => (
                            <Link key={store.slug} href={`/${data.slug}/${store.slug}`}>
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                                   <div className="flex items-center gap-3">
                                        <Store className="h-5 w-5 text-primary" />
                                        <span className="font-medium">{store.name}</span>
                                   </div>
                                   <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
