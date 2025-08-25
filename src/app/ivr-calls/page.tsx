
'use client'

import * as React from "react"
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
import { Download, ChevronDown, ChevronRight } from "lucide-react"

const callRecords = [
  {
    id: "call-001",
    storeId: "SD015",
    storeName: "Sandoz Restaurant - Paschim Vihar",
    startTime: "2025-07-14 18:24:16",
    endTime: "2025-07-14 18:25:27",
    callType: "Inbound",
    callStatus: "Answered",
    location: "Delhi",
    virtualNumber: "9619854351",
    customerNumber: "9625123133",
    recordingUrl: "#",
    duration: 58,
  },
  {
    id: "call-002",
    storeId: "SD012",
    storeName: "Anand Sweets - Jayanagar",
    startTime: "2025-07-14 17:55:02",
    endTime: "2025-07-14 17:55:25",
    callType: "Missed",
    callStatus: "Not Answered",
    location: "Bangalore",
    virtualNumber: "9619854350",
    customerNumber: "9876543210",
    recordingUrl: null,
    duration: 23,
  },
  {
    id: "call-003",
    storeId: "SD021",
    storeName: "Pizza Place - Indiranagar",
    startTime: "2025-07-14 16:30:11",
    endTime: "2025-07-14 16:32:45",
    callType: "Inbound",
    callStatus: "Answered",
    location: "Bangalore",
    virtualNumber: "9619854350",
    customerNumber: "9123456789",
    recordingUrl: "#",
    duration: 154,
  },
];

export default function IvrCallsPage() {
  const [openRow, setOpenRow] = React.useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Answered': return 'default';
        case 'Not Answered': return 'destructive';
        default: return 'secondary';
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  const handleToggleRow = (callId: string) => {
    setOpenRow(openRow === callId ? null : callId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IVR Call Records</CardTitle>
        <CardDescription>
          Review and download recorded calls from your IVR system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Store</TableHead>
                <TableHead className="hidden md:table-cell">Customer Number</TableHead>
                <TableHead className="hidden lg:table-cell">Call Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {callRecords.map((call) => (
                    <React.Fragment key={call.id}>
                        <TableRow onClick={() => handleToggleRow(call.id)} className="cursor-pointer">
                            <TableCell>
                                <Button variant="ghost" size="icon" className="w-9">
                                    {openRow === call.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </TableCell>
                            <TableCell>
                            <div className="font-medium">{call.storeName}</div>
                            <div className="text-sm text-muted-foreground">{call.storeId}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{call.customerNumber}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div>{call.startTime}</div>
                            </TableCell>
                            <TableCell>{formatDuration(call.duration)}</TableCell>
                            <TableCell>
                            <Badge variant={getStatusVariant(call.callStatus)}>
                                {call.callStatus}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            {call.recordingUrl ? (
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            ) : null}
                            </TableCell>
                        </TableRow>
                        {openRow === call.id && (
                             <TableRow>
                                <TableCell colSpan={7} className="p-0">
                                    <div className="p-6 bg-muted/50">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Call Status</span>
                                            <span>{call.callStatus}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Location</span>
                                            <span>{call.location}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Virtual Number</span>
                                            <span>{call.virtualNumber}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Customer Number</span>
                                            <span>{call.customerNumber}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Call Type</span>
                                            <span>{call.callType}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Call Recording URL</span>
                                            {call.recordingUrl ? <a href={call.recordingUrl} className="text-primary underline">Link</a> : <span>N/A</span>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Conversation Duration</span>
                                            <span>{call.duration} seconds</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Call Start Time</span>
                                            <span>{call.startTime}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold">Call End Time</span>
                                            <span>{call.endTime}</span>
                                        </div>
                                    </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}
