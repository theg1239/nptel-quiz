'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslator } from '@/hooks/useTranslator';

interface StatCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: number;
}

export default function StatCard({ icon, title, value }: StatCardProps) {
  const { formatNum, isRTL, isIndicScript } = useTranslator();
  
  const directionClass = isRTL ? 'flex-row-reverse' : 'flex-row';
  const scriptClass = isIndicScript ? 'text-[110%] tracking-wide' : '';
  
  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
      <CardContent className="p-6">
        <div className={`flex ${directionClass} items-center space-x-4`}>
          <div className="p-3 bg-gray-700/50 rounded-lg">{icon}</div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-2xl font-bold text-gray-100 ${scriptClass}`}>
              {formatNum(value)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
