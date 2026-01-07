"use client";

import { useState } from "react";
import { useAnalyticsData } from "@/hooks/useAnalytics";
import { Area, AreaChart, BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, TrendingUp, Wallet, CreditCard, DollarSign } from "lucide-react";

export default function Dashboard() {
    const [date, setDate] = useState(() => {
        const d = new Date();
        return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const { data, isLoading } = useAnalyticsData(date.month, date.year);

    if (isLoading) return <div className="p-10 text-emerald-600">Loading dashboard...</div>;
    if (!data) return <div className="p-10 text-red-500">Error loading data.</div>;

    const { currentMonth, trends, categories, history } = data;

    return (
        <div className="space-y-8 p-4 md:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-950">Financial Overview</h1>
                    <p className="text-emerald-600/80 mt-1">Track your wealth and spending habits.</p>
                </div>
                <div className="flex gap-3 items-center bg-white p-2 rounded-xl shadow-sm border border-emerald-100 mt-4 md:mt-0">
                    <select
                        value={date.month}
                        onChange={(e) => setDate(p => ({ ...p, month: parseInt(e.target.value) }))}
                        className="bg-emerald-50 text-emerald-900 text-sm font-medium rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select
                        value={date.year}
                        onChange={(e) => setDate(p => ({ ...p, year: parseInt(e.target.value) }))}
                        className="bg-emerald-50 text-emerald-900 text-sm font-medium rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Income"
                    value={currentMonth.income}
                    trend={trends.incomeChange}
                    icon={<Wallet className="h-6 w-6 text-emerald-600" />}
                    color="bg-emerald-50"
                />
                <StatCard
                    title="Total Expenses"
                    value={currentMonth.expense}
                    trend={trends.expenseChange}
                    inverse // Red for increase in expense
                    icon={<CreditCard className="h-6 w-6 text-rose-500" />}
                    color="bg-rose-50"
                />
                <StatCard
                    title="Net Balance"
                    value={currentMonth.net}
                    trend={0} // Net trend logic is complex, skipping for now
                    icon={<DollarSign className="h-6 w-6 text-blue-600" />}
                    color="bg-blue-50"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Spending Trend (Area Chart) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Spending Trend</h2>
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).getDate().toString()}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#F43F5E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Trend Summary Footer */}
                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Column 1: Daily Average */}
                            <div className="flex flex-col gap-3">
                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Daily Avg</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentMonth.expense / Math.max(history.length, 1))}
                                    </span>
                                </div>
                                <div className="h-32 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm relative flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold uppercase mb-2 ml-1">Last 5 Days</span>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={history.slice(-5)}>
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                                                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                                                    dy={5}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="bg-slate-800 text-white text-xs py-1 px-2 rounded mb-1">
                                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payload[0].value))}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="expense"
                                                    radius={[10, 10, 10, 10]}
                                                    barSize={20}
                                                >
                                                    {history.slice(-5).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 4 ? '#8b5cf6' : '#e2e8f0'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Max Spend */}
                            <div className="flex flex-col gap-3">
                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Max Spike</span>
                                        <span className="text-2xl font-bold text-slate-900">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.max(...history.map(h => h.expense)))}
                                        </span>
                                    </div>
                                    <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-rose-500" />
                                    </div>
                                </div>
                                <div className="h-24 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-slate-400 text-xs uppercase font-semibold">Highest Spend on</span>
                                        <div className="text-emerald-950 font-bold text-lg">
                                            {new Date(history.reduce((max, curr) => curr.expense > max.expense ? curr : max, history[0] || { date: '', expense: 0 }).date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Comparison */}
                            <div className="flex flex-col gap-3">
                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">vs Last Month</span>
                                    <div className={`flex items-center gap-2 font-bold text-xl ${trends.expenseChange > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {trends.expenseChange > 0 ? <TrendingUp className="w-6 h-6" /> : <ArrowDown className="w-6 h-6" />}
                                        <span>{Math.abs(trends.expenseChange).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="h-32 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm relative flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold uppercase mb-2 ml-1">VS Last Month</span>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { name: 'Last', value: currentMonth.expense / (1 + (trends.expenseChange / 100)) },
                                                    { name: 'This', value: currentMonth.expense }
                                                ]}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                                                    dy={5}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="bg-slate-800 text-white text-xs py-1 px-2 rounded mb-1">
                                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payload[0].value))}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    radius={[10, 10, 10, 10]}
                                                    barSize={30}
                                                >
                                                    {
                                                        [0, 1].map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={index === 1 ? (trends.expenseChange > 0 ? '#F43F5E' : '#10B981') : '#e2e8f0'}
                                                            />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Categories (Pie Chart) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Top Categories</h2>
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={10}
                                >
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={[
                                            "#10B981", // Emerald 500
                                            "#34D399", // Emerald 400
                                            "#6EE7B7", // Emerald 300
                                            "#A7F3D0", // Emerald 200
                                            "#ECFDF5", // Emerald 50
                                        ][index % 5]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text for Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-800">{categories.length}</span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Cats</span>
                        </div>
                    </div>
                    {/* Detailed Legend */}
                    <div className="mt-4 space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((cat, i) => (
                            <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-emerald-50/50 rounded-lg transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#ECFDF5"][i % 5] }}></div>
                                    <span className="text-slate-600 font-medium truncate max-w-[120px] group-hover:text-emerald-700 transition-colors">{cat.name}</span>
                                </div>
                                <span className="font-bold text-slate-900">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cat.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color, inverse = false }: { title: string, value: number, trend: number, icon: any, color: string, inverse?: boolean }) {
    const isPositive = trend > 0;
    // For expenses: Increase (Positive trend) is BAD (Red). Decrease is GOOD (Green).
    // For income: Increase is GOOD (Green). Decrease is BAD (Red).

    let trendColor = "text-emerald-600";
    let trendIcon = <ArrowUp className="w-4 h-4" />;

    if (inverse) { // Expenses
        if (isPositive) { trendColor = "text-rose-500"; trendIcon = <ArrowUp className="w-4 h-4" />; } // Expense went UP (Bad)
        else { trendColor = "text-emerald-600"; trendIcon = <ArrowDown className="w-4 h-4" />; } // Expense went DOWN (Good)
    } else { // Income
        if (!isPositive) { trendColor = "text-rose-500"; trendIcon = <ArrowDown className="w-4 h-4" />; } // Income went DOWN (Bad)
    }

    if (trend === 0) {
        trendColor = "text-gray-400";
        trendIcon = <span className="text-lg leading-none">-</span>;
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-[160px] transition-transform hover:scale-[1.02] duration-300">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${color}`}>
                    {icon}
                </div>
                {trend !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trendColor} bg-slate-50 px-2 py-1 rounded-lg`}>
                        {trendIcon}
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                </h3>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">{new Date(label).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="font-bold text-slate-800">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
                    </p>
                </div>
            </div>
        );
    }
    return null;
}
