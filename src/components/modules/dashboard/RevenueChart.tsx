"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; ingresos: number; pendientes: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Configuración de visualización local (Client Side solo)
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Flujo Financiero Mensual</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Sin datos financieros aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `S/ ${value}`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => [
                  `S/ ${value.toLocaleString()}`,
                  "",
                ]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
              />
              <Bar
                dataKey="ingresos"
                name="Ingresos Cobrados"
                fill="#047857" // Emerald-700
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="pendientes"
                name="Deuda Pendiente"
                fill="#f59e0b" // Amber-500
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
