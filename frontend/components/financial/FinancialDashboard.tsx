"use client";

import { useState, useEffect, useCallback } from "react";
import { getFinancialSummary } from "@/lib/api";

import FinancialHeader from "@/components/financial/FinancialHeader";
import FinancialKpis from "@/components/financial/FinancialKpis";
import SpendTrendChart from "@/components/financial/SpendTrendChart";
import SpendDonutCharts from "@/components/financial/SpendDonutCharts";
import TopVendorsFinancial from "@/components/financial/TopVendorsFinancial";
import AgingPayables from "@/components/financial/AgingPayables";
import CashFlowSummary from "@/components/financial/CashFlowSummary";
import BudgetGauge from "@/components/financial/BudgetGauge";
import MonthlySpendBarChart from "@/components/financial/MonthlySpendBarChart";
import UpcomingPaymentsTable from "@/components/financial/UpcomingPaymentsTable";

export default function FinancialDashboard() {
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("zampify_token");
      if (!token) return;
      
      const res = await getFinancialSummary();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6 pb-8">
      <FinancialHeader />
      <FinancialKpis data={data?.kpis} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <SpendTrendChart data={data?.spend_trend} />
        </div>
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
          <div className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
             <SpendDonutCharts data={data?.spend_by_category} title="Spend by Category" />
          </div>
          <div className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
             <SpendDonutCharts data={data?.spend_by_payment_terms} title="Spend by Payment Terms" isTerms />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <TopVendorsFinancial data={data?.top_vendors} />
        </div>
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <AgingPayables data={data?.aging_payables} />
        </div>
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <CashFlowSummary data={data?.cash_flow} />
        </div>
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <BudgetGauge data={data?.budget} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <MonthlySpendBarChart data={data?.monthly_spend} />
        </div>
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 flex flex-col">
          <UpcomingPaymentsTable data={data?.upcoming_payments} />
        </div>
      </div>
    </div>
  );
}
