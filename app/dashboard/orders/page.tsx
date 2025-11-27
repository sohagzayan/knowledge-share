import { requireUser } from "@/app/data/user/require-user";
import { OrderHistoryTable } from "./_components/OrderHistoryTable";

const demoOrders = [
  {
    id: "#4343",
    date: "August 29, 2025",
    amount: 11,
    status: "Completed" as const,
    courseName: "Learn JavaScript and Express to become a professional JavaScript",
  },
  {
    id: "#3707",
    date: "August 11, 2025",
    amount: 11,
    status: "Completed" as const,
    courseName: "Complete HTML, CSS and Javascript Course",
  },
  {
    id: "#3015",
    date: "November 28, 2024",
    amount: 50,
    status: "Completed" as const,
    courseName: "Advanced React with Redux Course",
  },
  {
    id: "#2643",
    date: "March 24, 2023",
    amount: 34,
    status: "On Hold" as const,
    courseName: "Angular with Nodejs Fullstack Development",
  },
  {
    id: "#2614",
    date: "March 17, 2023",
    amount: 11,
    status: "On Hold" as const,
    courseName: "REST APIs with Flask and Python Developer Course",
  },
  {
    id: "#1652",
    date: "January 30, 2023",
    amount: 590,
    status: "Completed" as const,
    courseName: "iOS & Swift Complete iOS Application Development Course",
  },
];

export default async function OrderHistoryPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">
            View and manage all your course purchase orders.
          </p>
        </div>
      </div>

      <OrderHistoryTable orders={demoOrders} />
    </div>
  );
}

