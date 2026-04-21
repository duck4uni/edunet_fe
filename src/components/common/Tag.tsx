import React from 'react';

type TagColor =
  | 'default'
  | 'success'
  | 'processing'
  | 'error'
  | 'warning'
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'gold'
  | 'purple'
  | 'cyan'
  | 'volcano'
  | string;

type TagProps = React.HTMLAttributes<HTMLSpanElement> & {
  color?: TagColor;
  icon?: React.ReactNode;
};

const COLOR_MAP: Record<string, { color: string; borderColor: string; backgroundColor: string }> = {
  default: { color: '#475467', borderColor: '#d0d5dd', backgroundColor: '#f2f4f7' },
  success: { color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  processing: { color: '#1d86a5', borderColor: '#82ddf2', backgroundColor: '#eefbfe' },
  error: { color: '#b91c1c', borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  warning: { color: '#b45309', borderColor: '#fdba74', backgroundColor: '#fff7ed' },
  blue: { color: '#1d86a5', borderColor: '#82ddf2', backgroundColor: '#eefbfe' },
  green: { color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  orange: { color: '#c2410c', borderColor: '#fdba74', backgroundColor: '#fff7ed' },
  red: { color: '#b91c1c', borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  gold: { color: '#b45309', borderColor: '#fcd34d', backgroundColor: '#fffbeb' },
  purple: { color: '#7e22ce', borderColor: '#d8b4fe', backgroundColor: '#faf5ff' },
  cyan: { color: '#0e7490', borderColor: '#67e8f9', backgroundColor: '#ecfeff' },
  volcano: { color: '#c2410c', borderColor: '#fdba74', backgroundColor: '#fff7ed' },
};

const resolveColor = (color: TagColor | undefined): { color: string; borderColor: string; backgroundColor: string } => {
  if (!color) {
    return COLOR_MAP.default;
  }

  if (COLOR_MAP[color]) {
    return COLOR_MAP[color];
  }

  return {
    color,
    borderColor: color,
    backgroundColor: '#ffffff',
  };
};

const Tag: React.FC<TagProps> = ({ color = 'default', icon, className, style, children, ...rest }) => {
  const palette = resolveColor(color);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        border: `1px solid ${palette.borderColor}`,
        borderRadius: 6,
        backgroundColor: palette.backgroundColor,
        color: palette.color,
        padding: '0 7px',
        lineHeight: '20px',
        fontSize: 12,
        ...style,
      }}
      {...rest}
    >
      {icon ? <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span> : null}
      {children}
    </span>
  );
};

export default Tag;
