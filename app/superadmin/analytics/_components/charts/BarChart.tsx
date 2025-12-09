"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface BarChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export function BarChartComponent({
  title,
  description,
  data,
  dataKey,
  xAxisKey,
  color = "hsl(var(--chart-1))",
  height = 300,
}: BarChartProps) {
  const config = {
    [dataKey]: {
      label: title,
      color,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`h-[${height}px] w-full`}>
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                if (typeof value === "string" && value.length > 10) {
                  return value.substring(0, 10) + "...";
                }
                return value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (typeof value === "string" && value.includes("-")) {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

