'use client';

import Link from 'next/link';
import { Module } from '@/types';

interface ModuleCardProps {
  module: Module;
}

const iconMap: Record<string, string> = {
  'shield-check': '🛡️',
  'receipt': '📊',
  'clipboard-check': '✓',
};

const colorMap: Record<string, { bg: string; hover: string; border: string }> = {
  blue: {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    border: 'border-blue-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    hover: 'hover:bg-emerald-100',
    border: 'border-emerald-200',
  },
  violet: {
    bg: 'bg-violet-50',
    hover: 'hover:bg-violet-100',
    border: 'border-violet-200',
  },
};

export default function ModuleCard({ module }: ModuleCardProps) {
  const colors = colorMap[module.color] || colorMap.blue;

  return (
    <Link href={module.href}>
      <div
        className={`group relative overflow-hidden rounded-xl border-2 ${colors.border} ${colors.bg} p-8 transition-all duration-200 ${colors.hover} hover:shadow-lg hover:scale-[1.02]`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="text-4xl">{iconMap[module.icon]}</div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {module.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
