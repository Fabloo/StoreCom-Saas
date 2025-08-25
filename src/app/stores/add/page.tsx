
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreForm } from "@/components/forms/store-form";

export default function AddStorePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Store</CardTitle>
        <CardDescription>Enter the details for the new store location.</CardDescription>
      </CardHeader>
      <CardContent>
        <StoreForm />
      </CardContent>
    </Card>
  );
}
