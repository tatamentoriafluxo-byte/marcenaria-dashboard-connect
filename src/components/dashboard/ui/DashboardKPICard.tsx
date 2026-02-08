import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";

interface MiniChartData {
  value: number;
}

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  progress?: number; // 0-100
  progressColor?: "success" | "danger" | "warning" | "default";
  trend?: {
    value: number;
    label?: string;
    positive?: boolean;
  };
  miniChart?: {
    data: MiniChartData[];
    type: "bar" | "line";
    color?: string;
  };
  valueColor?: "success" | "danger" | "warning" | "default";
  className?: string;
}

const colorMap = {
  success: "text-dashboard-success",
  danger: "text-dashboard-danger",
  warning: "text-dashboard-warning",
  default: "text-foreground",
};

const progressColorMap = {
  success: "bg-dashboard-success",
  danger: "bg-dashboard-danger",
  warning: "bg-dashboard-warning",
  default: "bg-primary",
};

export function DashboardKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  progressColor = "success",
  trend,
  miniChart,
  valueColor = "default",
  className,
}: DashboardKPICardProps) {
  const chartColor = miniChart?.color || "hsl(var(--dashboard-orange))";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1">
            <div className={cn("text-2xl font-bold", colorMap[valueColor])}>
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-dashboard-success" : "text-dashboard-danger"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%{trend.label && ` ${trend.label}`}
              </p>
            )}
          </div>
          {miniChart && (
            <div className="h-12 w-20">
              <ResponsiveContainer width="100%" height="100%">
                {miniChart.type === "bar" ? (
                  <BarChart data={miniChart.data}>
                    <Bar dataKey="value" fill={chartColor} radius={[2, 2, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={miniChart.data}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={chartColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="space-y-1">
            <Progress
              value={Math.min(progress, 100)}
              className="h-2"
              style={
                {
                  "--progress-background": `hsl(var(--dashboard-${progressColor === "default" ? "success" : progressColor}))`,
                } as React.CSSProperties
              }
            />
            <p className="text-xs text-muted-foreground text-right">
              {progress.toFixed(0)}% da meta
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
