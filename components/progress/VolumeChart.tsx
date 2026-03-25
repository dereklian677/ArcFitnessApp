'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VolumeDataPoint } from '@/lib/hooks/useProgress'

interface VolumeChartProps {
  data: VolumeDataPoint[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-[#a1a1aa]">
        No workout data in the last 30 days
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111111',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            color: '#ffffff',
          }}
          formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Volume']}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Area
          type="monotone"
          dataKey="volume"
          stroke="#7C3AED"
          strokeWidth={2}
          fill="url(#volumeGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
