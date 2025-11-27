"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { IconSearch, IconEye } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceModal } from "./InvoiceModal";

type OrderStatus = "Completed" | "On Hold" | "Pending" | "Cancelled";

type Order = {
  id: string;
  date: string;
  amount: number;
  status: OrderStatus;
  courseName: string;
};

type OrderHistoryTableProps = {
  orders: readonly Order[];
};

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.courseName.toLowerCase().includes(query) ||
        order.date.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "Completed":
        return "default";
      case "On Hold":
        return "secondary";
      case "Pending":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500";
      case "On Hold":
        return "bg-amber-500";
      case "Pending":
        return "bg-blue-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="space-y-6 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg shadow-black/5 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-border/70 bg-background/70 pl-10 pr-4 transition focus-visible:border-primary focus-visible:ring-primary/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/30">
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-16 text-right font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No orders found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                    className="border-b border-border/30 transition hover:bg-muted/20"
                  >
                    <TableCell className="font-medium text-primary">{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    <TableCell className="font-semibold">${order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="gap-1.5 rounded-full border-0 px-3 py-1 text-xs font-medium"
                      >
                        <span
                          className={`size-1.5 rounded-full ${getStatusColor(order.status)}`}
                        />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="h-8 w-8 rounded-lg p-0 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <IconEye className="size-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedOrder && (
        <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}

