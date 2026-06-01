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
import { colorForCategory } from '../lib/colors';
import { Card, ChartIcon, EmptyState, SectionTitle } from '../components/ui';

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #ddd6fe',
  borderRadius: 12,
  color: '#475569',
  fontSize: 12,
  boxShadow: '0 6px 20px rgba(139,92,246,0.18)',
};

const GRID = 'rgba(148,163,184,0.25)';
const AXIS = '#94a3b8';

export function Charts() {
  const months = useBudgetStore((s) => s.months);
  const categoryColors = useBudgetStore((s) => s.categoryColors);
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
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="name" stroke={AXIS} fontSize={12} tickLine={false} />
                <YAxis
                  stroke={AXIS}
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
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="実績"
                  stroke="#38bdf8"
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
            <EmptyState compact icon={<ChartIcon />} title="支出予算がありません" />
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
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={colorForCategory(d.name, categoryColors)} />
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
            <EmptyState compact icon={<ChartIcon />} title="データがありません" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={AXIS}
                    fontSize={11}
                    tickFormatter={(v) => `${Math.round(v / 10000)}万`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={AXIS}
                    fontSize={11}
                    width={64}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => `${num(Number(v))}円`}
                    cursor={{ fill: 'rgba(139,92,246,0.06)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="予算" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="実績" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
