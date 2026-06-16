'use client';

import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'honey';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  size = 'md',
  className = '',
  type = 'button',
}: ButtonProps) {
  const variants = {
    primary: 'bg-eucalyptus text-white border-eucalyptus',
    secondary: 'bg-transparent text-ink border-edge',
    ghost: 'bg-transparent text-ink-soft border-transparent',
    danger: 'bg-transparent text-vermillion border-vermillion-soft',
    honey: 'bg-honey text-white border-honey',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[0.82rem]',
    md: 'px-4 py-2 text-[0.92rem]',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border font-medium tracking-wide rounded-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function Hairline({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-edge ${className}`} />;
}

export function IslamicDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-px bg-edge" />
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <polygon
          points="8,1 9.15,5.23 12.95,3.05 10.77,6.85 15,8 10.77,9.15 12.95,12.95 9.15,10.77 8,15 6.85,10.77 3.05,12.95 5.23,9.15 1,8 5.23,6.85 3.05,3.05 6.85,5.23"
          fill="#2A9D8F"
          opacity="0.5"
        />
      </svg>
      <div className="flex-1 h-px bg-edge" />
    </div>
  );
}

export function Field({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 ${highlight ? 'border-l-2 border-honey pl-2.5' : ''}`}
    >
      <div className="min-w-[6.5rem] text-[0.72rem] uppercase tracking-[0.1em] text-ink-soft pt-0.5 font-medium font-body">
        {label}
      </div>
      <div className={`flex-1 ${mono ? 'font-mono text-[0.82rem]' : 'font-body text-[0.9rem]'}`}>
        {value}
      </div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="text-eucalyptus opacity-40">
        <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <polygon points="8,1 9.15,5.23 12.95,3.05 10.77,6.85 15,8 10.77,9.15 12.95,12.95 9.15,10.77 8,15 6.85,10.77 3.05,12.95 5.23,9.15 1,8 5.23,6.85 3.05,3.05 6.85,5.23" />
        </svg>
      </div>
      <h3 className="font-display text-2xl text-ink mt-4">{title}</h3>
      <p className="font-display italic text-ink-soft mt-2 max-w-md text-base leading-relaxed">
        {body}
      </p>
    </div>
  );
}
