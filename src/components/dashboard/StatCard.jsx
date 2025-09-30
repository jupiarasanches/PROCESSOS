import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = "blue",
  subtitle 
}) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-600"
  };

  const bgColorClasses = {
    blue: "bg-blue-50",
    green: "bg-green-50", 
    amber: "bg-amber-50",
    red: "bg-red-50",
    purple: "bg-purple-50"
  };
  
  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-600",
  }

  return (
    <Card className="relative overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 ${bgColorClasses[color]} rounded-full opacity-20`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="text-3xl font-bold text-gray-900">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColorClasses[color]}`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        </div>
      </CardHeader>
      
      {(trend || trendValue) && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendValue}
            </span>
            <span className="text-gray-500">em relação ao mês anterior</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}