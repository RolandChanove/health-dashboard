// Shared Recharts styling for the dark theme.
// Pass these as spread props to every <Tooltip> so colors are consistent.

export const TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: '#1C1C1E',
    border: '1px solid #3E3E42',
    borderRadius: 10,
    fontSize: 12,
    color: '#E0E0E2',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  },
  labelStyle:  { color: '#E0E0E2', fontWeight: 600, marginBottom: 2 },
  itemStyle:   { color: '#C8C8CA' },
  wrapperStyle: { outline: 'none' },
}

export const CHART_GRID   = '#2E2E30'
export const CHART_TICK   = '#8E8E92'
export const BRAND_LINE   = '#9C3848'
export const GOLD_LINE    = '#E8C547'
export const BLUE_LINE    = '#5D707F'
export const BAR_CURSOR   = { fill: 'rgba(255,255,255,0.04)' }
