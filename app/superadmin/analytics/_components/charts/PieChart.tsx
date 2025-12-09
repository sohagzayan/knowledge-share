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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

interface PieChartProps {
  title: string;
  description?: string;
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
}

const defaultColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PieChartComponent({
  title,
  description,
  data,
  colors = defaultColors,
  height = 300,
}: PieChartProps) {
  const chartConfig: ChartConfig = {};
  data.forEach((item, index) => {
    chartConfig[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={`h-[${height}px] w-full`}>
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-bottom-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

