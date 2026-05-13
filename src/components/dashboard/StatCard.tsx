import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  growth?: string;
  icon?: React.ReactNode;
  color?: 'orange' | 'blue' | 'purple' | 'red';
  isAlert?: boolean;
}

export default function StatCard({
  title,
  value,
  growth,
  icon,
  color = 'orange',
  isAlert = false,
}: StatCardProps) {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={`group bg-[#232342] rounded-3xl p-6 border border-white/5 hover:border-orange-500/30 transition-all duration-300 shadow-xl ${isAlert ? 'ring-1 ring-red-500/50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]} transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        {growth && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${growth.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {growth}
          </span>
        )}
      </div>

      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      
      <div className="flex items-baseline gap-2 mt-1">
        <h2 className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors">
          {value}
        </h2>
      </div>
    </div>
  );
}