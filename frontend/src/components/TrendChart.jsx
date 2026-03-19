import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data }) => {
    return (
        <div className="glass card" style={{ height: '450px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Waste Level Trends</h3>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            stroke="var(--text-secondary)"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-color)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)'
                            }}
                            itemStyle={{ color: 'var(--accent-primary)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="fillLevel"
                            stroke="var(--accent-primary)"
                            fillOpacity={1}
                            fill="url(#colorFill)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
