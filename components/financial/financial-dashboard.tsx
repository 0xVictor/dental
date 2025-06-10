"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, MoreHorizontal, Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface FinancialDashboardProps {
  data: any
  tenant: any
}

export function FinancialDashboard({ data, tenant }: FinancialDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")

  // Sample financial data
  const financialStats = [
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Outstanding",
      value: "$3,200",
      change: "-8.2%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      title: "Collected",
      value: "$9,250",
      change: "+15.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Avg. Transaction",
      value: "$285",
      change: "+3.1%",
      trend: "up",
      icon: CreditCard,
      color: "text-blue-500",
    },
  ]

  const recentTransactions = [
    {
      id: "TXN-1234",
      patientName: "John Smith",
      amount: "$150.00",
      type: "payment",
      method: "Credit Card",
      status: "completed",
      date: "2023-06-15",
      description: "Annual check-up and cleaning",
    },
    {
      id: "TXN-1235",
      patientName: "Sarah Johnson",
      amount: "$275.00",
      type: "payment",
      method: "Insurance",
      status: "completed",
      date: "2023-06-14",
      description: "Cavity filling treatment",
    },
    {
      id: "TXN-1236",
      patientName: "Michael Brown",
      amount: "$850.00",
      type: "payment",
      method: "Cash",
      status: "pending",
      date: "2023-06-13",
      description: "Root canal therapy",
    },
    {
      id: "TXN-1237",
      patientName: "Emily Davis",
      amount: "$95.00",
      type: "refund",
      method: "Credit Card",
      status: "completed",
      date: "2023-06-12",
      description: "Consultation refund",
    },
    {
      id: "TXN-1238",
      patientName: "David Wilson",
      amount: "$320.00",
      type: "payment",
      method: "Debit Card",
      status: "failed",
      date: "2023-06-11",
      description: "Dental cleaning and fluoride",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-800"
      case "refund":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart and Collection Rate */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and payment trends</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Revenue chart would be displayed here
              <br />
              (Integration with charting library like Recharts)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Collection Rate</CardTitle>
            <CardDescription>Payment collection performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm text-muted-foreground">74.3%</span>
              </div>
              <Progress value={74.3} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Month</span>
                <span className="text-sm text-muted-foreground">68.1%</span>
              </div>
              <Progress value={68.1} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">3 Months Ago</span>
                <span className="text-sm text-muted-foreground">71.8%</span>
              </div>
              <Progress value={71.8} className="h-2" />
            </div>
            <div className="pt-4 border-t">
              <div className="text-2xl font-bold text-green-600">+6.2%</div>
              <p className="text-xs text-muted-foreground">Improvement from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activities and transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.patientName}</TableCell>
                    <TableCell className="font-medium">{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transaction.type)}>{transaction.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{transaction.method}</TableCell>
                    <TableCell className="hidden md:table-cell">{transaction.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                          <DropdownMenuItem>Process Refund</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
