
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const enquiries = [
  { id: "enq-001", name: "Alex Johnson", email: "alex.j@example.com", phone: "555-0101", store: "Downtown Branch", message: "Do you offer gluten-free options?", date: "2024-07-22", status: "New" },
  { id: "enq-002", name: "Maria Garcia", email: "maria.g@example.com", phone: "555-0102", store: "Westwood Store", message: "Interested in catering for a small event.", date: "2024-07-21", status: "Contacted" },
  { id: "enq-003", name: "David Chen", email: "david.c@example.com", phone: "555-0103", store: "River North", message: "What are your holiday hours?", date: "2024-07-21", status: "Resolved" },
  { id: "enq-004", name: "Fatima Ahmed", email: "fatima.a@example.com", phone: "555-0104", store: "South Beach", message: "Question about an online order.", date: "2024-07-20", status: "New" },
  { id: "enq-005", name: "Kenji Tanaka", email: "kenji.t@example.com", phone: "555-0105", store: "Beacon Hill", message: "Is the patio dog-friendly?", date: "2024-07-19", status: "Resolved" },
];

export default function EnquiriesPage() {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'New': return 'destructive';
            case 'Contacted': return 'secondary';
            case 'Resolved': return 'default';
            default: return 'outline';
        }
    }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enquiries</CardTitle>
        <CardDescription>
            Leads and questions submitted through your microsite contact forms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Store</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell>
                  <div className="font-medium">{enquiry.name}</div>
                  <div className="text-sm text-muted-foreground">{enquiry.email}</div>
                  <div className="text-sm text-muted-foreground">{enquiry.phone}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{enquiry.store}</TableCell>
                <TableCell className="max-w-[300px] truncate">{enquiry.message}</TableCell>
                <TableCell className="hidden lg:table-cell">{enquiry.date}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(enquiry.status)}>
                    {enquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
