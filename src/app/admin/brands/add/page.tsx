
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddBrandPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboard New Brand</CardTitle>
        <CardDescription>Enter the details for the new brand to get them started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input id="brand-name" placeholder="e.g., Anand Sweets" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="microsite-slug">Microsite Slug</Label>
            <Input id="microsite-slug" placeholder="e.g., anand-sweets" />
             <p className="text-xs text-muted-foreground">This will be the URL for the brand's microsite. (e.g., yourdomain.com/anand-sweets)</p>
          </div>
          <div className="flex justify-end">
            <Button>Onboard Brand</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
