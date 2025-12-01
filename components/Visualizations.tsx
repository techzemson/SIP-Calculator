import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartsProps {
  invested: number;
  returns: number;
  growthData: ChartDataPoint[];
}

const COLORS = ['#94a3b8', '#2563eb']; // Slate-400 (Invested), Primary-600 (Returns)

export const ResultCharts: React.FC<ChartsProps> = ({ invested, returns, growthData }) => {
  
  const pieData = [
    { name: 'Invested', value: invested },
    { name: 'Returns', value: returns },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Doughnut Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Wealth Distribution</h3>
        <div className="w-full h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70} // Make it a doughnut
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total</span>
             <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Value</span>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[300px]">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Wealth Growth Trajectory</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={growthData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 11}} 
                dy={10}
                interval="preserveStartEnd" 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 11}}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                width={40}
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 formatter={(value: number) => value.toLocaleString()}
              />
              <Area 
                type="monotone" 
                dataKey="Wealth" 
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorWealth)" 
                strokeWidth={3}
                name="Total Value"
              />
              <Area 
                type="monotone" 
                dataKey="Invested" 
                stroke="#94a3b8" 
                fill="transparent" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Invested"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};