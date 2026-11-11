
function StatCard({ title, amount, change, icon: Icon, color, trendColor = 'text-emerald-600' }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      {/* Amount */}
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {amount}
      </h2>

      {/* Trend */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-semibold ${trendColor}`}>
          {change}
        </span>
        <span className="text-xs text-slate-400">
          vs last month
        </span>
      </div>

    </div>
  );
}

export default StatCard;
