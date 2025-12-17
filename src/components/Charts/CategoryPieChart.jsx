import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const CategoryPieChart = ({ data }) => {
  const chartData = Object.values(data.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = { name: curr.category, value: 0 };
    acc[curr.category].value += parseFloat(curr.amount);
    return acc;
  }, {}));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 pb-15 rounded-xl shadow-sm h-80 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Expense by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;