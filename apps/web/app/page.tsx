"use client";
import { useMemo, useState } from "react";
import { useSpendByCategory, useMonthlyTrend } from "@/hooks/useAnalytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [year, setYear] = useState(() => new Date().getFullYear());

  const { from, to } = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)).toISOString();
    return { from: start, to: end };
  }, [month]);

  const spend = useSpendByCategory({ from, to });
  const trend = useMonthlyTrend(year);

  const kpis = useMemo(() => {
    const totalSpend = (spend.data ?? []).reduce((s, r) => s + Number(r.spend), 0);
    const mt = trend.data ?? [];
    const totalIncomeY = mt.reduce((s, r) => s + Number(r.income), 0);
    const totalSpendY = mt.reduce((s, r) => s + Number(r.spend), 0);

    const monthIncome = 0;
    const monthBalance = -totalSpend;
    return { totalSpend, totalIncomeY, totalSpendY, monthBalance };
  }, [spend.data, trend.data]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex gap-2 items-center">
        <label className="text-sm">Month</label>
        <input type="month" className="border rounded px-2 py-1" value={month} onChange={(e) => setMonth(e.target.value)} />
        <label className="text-sm ml-4">Year</label>
        <input type="number" className="border rounded px-2 py-1 w-24" value={year} onChange={(e) => setYear(parseInt(e.target.value || "0", 10))} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi title="Spend (month)" value={`€${kpis.totalSpend.toFixed(2)}`} />
        <Kpi title="Income (year)" value={`€${kpis.totalIncomeY.toFixed(2)}`} />
        <Kpi title="Spend (year)" value={`€${kpis.totalSpendY.toFixed(2)}`} />
        <Kpi title="Balance (month)" value={`€${kpis.monthBalance.toFixed(2)}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-80 border rounded p-3">
          <h2 className="font-medium mb-2">Spend by Category</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={(spend.data ?? []).map(d => ({ name: d.categoryName ?? "Uncategorized", value: Number(d.spend) }))}
                dataKey="value"
                nameKey="name"
                innerRadius="50%"
                outerRadius="80%"
              >
                {(spend.data ?? []).map((_, i) => <Cell key={i} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 border rounded p-3">
          <h2 className="font-medium mb-2">Monthly Trend ({year})</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(trend.data ?? []).map(d => ({ ...d, income: Number(d.income), spend: Number(d.spend) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" />
              <Line type="monotone" dataKey="spend" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}