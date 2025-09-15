import React, { useState, useMemo } from 'react';
import type { FinancialData, CostEntry } from '../types';
import { CostCategory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-secondary p-2 border border-brand-accent rounded-md shadow-lg">
        <p className="label text-sm text-brand-light">{`Data: ${label}`}</p>
        <p className="intro text-brand-text font-bold">{`Custo Acumulado: R$ ${payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
      </div>
    );
  }
  return null;
};


interface CostCenterProps {
    financialData: FinancialData;
    onAddCostEntry: (entry: Omit<CostEntry, 'id'>) => void;
    onDeleteCostEntry: (entryId: number) => void;
}

export const CostCenterDashboard: React.FC<CostCenterProps> = ({ financialData, onAddCostEntry, onDeleteCostEntry }) => {
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CostCategory>(CostCategory.Other);

    const { dailyCostsTotal, totalCost, costTrendData, budgetStatus } = useMemo(() => {
        const dailyCostsTotal = financialData.costEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const totalCost = financialData.materials + financialData.labor + dailyCostsTotal;
        
        const sortedEntries = financialData.costEntries.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let cumulativeAmount = financialData.materials + financialData.labor;
        const trendData = sortedEntries.map(entry => {
            cumulativeAmount += entry.amount;
            return {
                date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                custo: cumulativeAmount
            };
        });

        const budgetPercentage = financialData.budget > 0 ? (totalCost / financialData.budget) * 100 : 0;
        let progressBarColor = 'bg-status-completed';
        if (budgetPercentage > 90) progressBarColor = 'bg-status-alert';
        else if (budgetPercentage > 75) progressBarColor = 'bg-status-progress';
        
        return { 
            dailyCostsTotal, 
            totalCost, 
            costTrendData: trendData,
            budgetStatus: {
                percentage: budgetPercentage,
                remaining: financialData.budget - totalCost,
                color: progressBarColor,
            }
        };
    }, [financialData]);
    
    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (date && description && !isNaN(numAmount) && numAmount > 0) {
            onAddCostEntry({ date, description, amount: numAmount, category });
            setDate('');
            setDescription('');
            setAmount('');
            setCategory(CostCategory.Other);
        }
    };
    
    const handleExportCSV = () => {
        if (financialData.costEntries.length === 0) {
            alert('Não há custos para exportar.');
            return;
        }

        const headers = 'Data;Descrição;Valor;Categoria';
        const rows = financialData.costEntries.map(entry => {
            const [year, month, day] = entry.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            const escapedDescription = `"${entry.description.replace(/"/g, '""')}"`;
            const formattedAmount = entry.amount.toFixed(2).replace('.', ',');
            return [formattedDate, escapedDescription, formattedAmount, entry.category].join(';');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "relatorio_de_custos.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-brand-secondary p-4 rounded-lg shadow-lg h-full flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-brand-text text-center">Central de Custo</h3>
            
            {/* Budget Status */}
            <div className="bg-brand-primary p-4 rounded-lg">
                 <h4 className="text-lg font-semibold text-brand-text mb-2">Status do Orçamento</h4>
                 <div className="text-sm flex justify-between mb-1">
                    <span className="text-brand-text">Gasto: R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-brand-light">Total: R$ {financialData.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className={`${budgetStatus.color} h-4 rounded-full text-center text-xs text-white font-bold flex items-center justify-center`} style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}>
                       {budgetStatus.percentage > 10 && `${budgetStatus.percentage.toFixed(1)}%`}
                    </div>
                 </div>
                 <p className={`text-right mt-1 text-sm font-medium ${budgetStatus.remaining < 0 ? 'text-status-alert' : 'text-brand-light'}`}>
                    Restante: R$ {budgetStatus.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
            </div>

            {/* Cost Trend */}
            <div className="bg-brand-primary p-4 rounded-lg flex-grow flex flex-col min-h-[250px]">
                <h4 className="text-lg font-semibold text-brand-text mb-2">Tendência de Custo</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={costTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="custo" name="Custo Acumulado" stroke="#e53e3e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Costs */}
            <div className="bg-brand-primary p-4 rounded-lg flex-grow flex flex-col min-h-0">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-brand-text">Custos Diários</h4>
                    <button onClick={handleExportCSV} className="bg-status-completed/80 hover:bg-status-completed text-white font-bold py-1 px-3 rounded transition text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Exportar
                    </button>
                </div>
                <form onSubmit={handleAddEntry} className="grid grid-cols-2 gap-2 mb-3">
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent" />
                    <select value={category} onChange={e => setCategory(e.target.value as CostCategory)} className="bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent">
                        {Object.values(CostCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} required className="bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text col-span-2 focus:ring-brand-accent focus:border-brand-accent" />
                    <div className="flex gap-2 col-span-2">
                      <input type="number" placeholder="Valor (R$)" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="flex-grow bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent" />
                      <button type="submit" title="Adicionar Custo" className="bg-brand-accent hover:bg-red-500 text-white font-bold p-2 rounded transition aspect-square flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      </button>
                    </div>
                </form>
                <div className="overflow-y-auto flex-grow -mr-2 pr-2 text-sm">
                    {financialData.costEntries.length > 0 ? (
                        financialData.costEntries.slice().reverse().map(entry => (
                            <div key={entry.id} className="grid grid-cols-3 gap-2 p-2 border-b border-gray-200 items-center">
                                <div className="col-span-2">
                                    <p className="font-semibold text-brand-text">{entry.description}</p>
                                    <p className="text-xs text-brand-light">{entry.date.split('-').reverse().join('/')} - <span className="font-semibold">{entry.category}</span></p>
                                </div>
                                <div className="text-right flex items-center justify-end gap-2">
                                    <span className="font-bold">R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <button onClick={() => onDeleteCostEntry(entry.id)} className="p-1 text-status-alert hover:text-red-400 transition" title="Excluir Custo">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 4.811 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-brand-light">Nenhum custo adicionado.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
