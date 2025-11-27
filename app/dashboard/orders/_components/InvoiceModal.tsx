"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "Completed" | "On Hold" | "Pending" | "Cancelled";

type Order = {
  id: string;
  date: string;
  amount: number;
  status: OrderStatus;
  courseName: string;
};

type InvoiceModalProps = {
  order: Order;
  onClose: () => void;
};

const numberToWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return one === 0 ? tens[ten] : `${tens[ten]} ${ones[one]}`;
  }
  return "Dollar " + num.toString();
};

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const invoiceNumber = order.id.replace("#", "");
  const dueDate = new Date(order.date);
  dueDate.setMonth(dueDate.getMonth() + 3);
  const formattedDueDate = dueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="h-[95vh] w-[1200px] max-w-[1200px] overflow-hidden border-none bg-background p-0 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-full flex-col"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-lg transition hover:bg-destructive/10 hover:text-destructive"
            >
              <IconX className="size-4" />
            </Button>

            <div className="flex h-full flex-col space-y-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-background/95 p-10 shadow-xl">
              <DialogHeader className="space-y-4 border-b border-border/50 pb-6">
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-3xl font-bold">Invoice</DialogTitle>
                  <Badge
                    variant="default"
                    className={`gap-1.5 rounded-full border-0 px-4 py-1.5 text-sm font-medium ${getStatusColor(order.status)} text-white`}
                  >
                    <span className="size-1.5 rounded-full bg-white" />
                    {order.status}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Invoice Number
                    </p>
                    <p className="text-xl font-semibold text-destructive">#{invoiceNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                    <p className="text-base font-medium">{order.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p className="text-base font-medium">{formattedDueDate}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    From
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold">KnowledgeShare</p>
                    <p className="text-sm text-muted-foreground">
                      Online Learning Platform
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email: support@knowledgeshare.com
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                    To
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">Student</p>
                    <p className="text-sm text-muted-foreground">
                      Email: student@example.com
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Item Details
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 bg-muted/30">
                        <TableHead className="min-w-[400px] py-3 text-sm font-semibold">Description</TableHead>
                        <TableHead className="text-center py-3 text-sm font-semibold">Qty</TableHead>
                        <TableHead className="text-right py-3 text-sm font-semibold">Cost</TableHead>
                        <TableHead className="text-right py-3 text-sm font-semibold">Discount</TableHead>
                        <TableHead className="text-right py-3 text-sm font-semibold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/30">
                        <TableCell className="py-3 text-sm font-medium">{order.courseName}</TableCell>
                        <TableCell className="py-3 text-center text-sm">1</TableCell>
                        <TableCell className="py-3 text-right text-sm">${order.amount}</TableCell>
                        <TableCell className="py-3 text-right text-sm">$0</TableCell>
                        <TableCell className="py-3 text-right text-sm font-semibold">
                          ${order.amount}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sub Total</span>
                    <span className="font-medium">${order.amount}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Total Amount</span>
                    <span className="text-lg font-bold">${order.amount}</span>
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground">
                    Amount in Words:{" "}
                    <span className="font-medium capitalize">
                      Dollar {numberToWords(order.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Invoice for course purchase, covering course fee, discounts, and
                    applicable taxes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Full payment grants non-transferable access to the course, subject to
                    the provider's refund policy.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-sm font-semibold">Course Provider</p>
                <p className="text-sm text-muted-foreground">KnowledgeShare</p>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}

