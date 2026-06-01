import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBudgetStore, useCurrentMonth } from '../store/budgetStore';
import {
  actualEndBalance,
  expenseCategorySummary,
  projectedEndBalance,
} from '../lib/calc';
import { num, yen } from '../lib/format';
import { Card, SectionTitle } from '../components/ui';

const PALETTE = [
  '#34d399',
  '#60a5fa',
  '#f472b6',
  '#fbbf24',
  '#a78bfa',
  '#22d3ee',
  '#fb7185',
  '#4ade80',
  '#facc15',
  '#818cf8',
];

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 12,
};

export function Charts() {
  const months = useBudgetStore((s) => s.months);
  const month = useCurrentMonth();

  const trend = months.map((m) => ({
    name: m.label,
    見込み: projectedEndBalance(m),
    実績: actualEndBalance(m),
    死守ライン: m.defenseLine,
  }));

  const cats = expenseCategorySummary(month);
  const pieData = cats.filter((c) => c.budget > 0).map((c) => ({
    name: c.category,
    value: c.budget,
  }));
  const barData = cats.map((c) => ({
    name: c.category,
    予算: c.budget,
    実績: c.spent,
  }));

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <SectionTitle>月末残高の推移</SectionTitle>
        <Card className="p-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) => `${Math.round(v / 10000)}万`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => yen(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="見込み"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="実績"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="死守ライン"
                  stroke="#fb7185"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <SectionTitle>{month.label}の支出予算の内訳</SectionTitle>
        <Card className="p-4">
          {pieData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              支出予算がありません。
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => yen(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <SectionTitle>{month.label}の予算 vs 実績</SectionTitle>
        <Card className="p-4">
          {barData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              データがありません。
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${Math.round(v / 10000)}万`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={64}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => `${num(Number(v))}円`}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="予算" fill="#475569" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="実績" fill="#34d399" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
