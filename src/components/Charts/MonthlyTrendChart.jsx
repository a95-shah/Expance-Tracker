import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyTrendChart = ({ data }) => {
  const chartData = Object.values(data.reduce((acc, curr) => {
    const date = curr.date.split('T')[0];
    if (!acc[date]) acc[date] = { date, amount: 0 };
    acc[date].amount += parseFloat(curr.amount);
    return acc;
  }, {})).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 pb-15 rounded-xl shadow-sm h-80 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Spending Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
          <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
          <YAxis tick={{fontSize: 12}} stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
          />
          <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;