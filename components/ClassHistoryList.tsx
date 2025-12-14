import React, { useState, useEffect, useMemo } from 'react';
import { fetchClassHistory } from '../services/sheetService.ts';
import { ClassHistoryEntry, User } from '../types.ts';
import { Loader2, CheckCircle, XCircle, Search, Filter, ChevronDown, FileCheck, ArrowUpDown, Clock, CalendarDays } from 'lucide-react';

interface ClassHistoryListProps {
  currentUser?: User;
}

const parseDate = (dateStr: string): Date | null => {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart) return null;
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second || 0));
  } catch (e) {
    return null;
  }
};

export const ClassHistoryList: React.FC<ClassHistoryListProps> = ({ currentUser }) => {
  const [history, setHistory] = useState<ClassHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchClassHistory();
        const sortedData = data.sort((a, b) => {
            const dateA = parseDate(a.endTime)?.getTime() || 0;
            const dateB = parseDate(b.endTime)?.getTime() || 0;
            return dateB - dateA;
        });
        setHistory(sortedData); 
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const classTypes = useMemo(() => {
    const types = new Set(history.map(item => item.className));
    return Array.from(types).sort();
  }, [history]);

  const filteredHistory = useMemo(() => {
    const filtered = history.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.professor.toLowerCase().includes(searchLower) || 
        item.students.toLowerCase().includes(searchLower) || 
        item.className.toLowerCase().includes(searchLower)
      ) && (selectedType === 'all' || item.className === selectedType);
    });

    return filtered.sort((a, b) => {
      const dateA = parseDate(a.endTime)?.getTime() || 0;
      const dateB = parseDate(b.endTime)?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [history, searchTerm, selectedType, sortOrder]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand mb-4" size={32} />
        <p className="text-slate-400 font-medium text-sm tracking-wide">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col gap-2">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Relatório de Aulas</h2>
         <p className="text-slate-500 text-sm">Registro completo de aulas aplicadas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar histórico..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-dark-surface rounded-xl focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-hover transition-all font-medium text-slate-700 dark:text-white placeholder-slate-400 text-sm"
              />
           </div>

           <div className="flex gap-4">
               <div className="relative min-w-[200px] flex-1 md:flex-none">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-white dark:bg-dark-surface rounded-xl focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-hover transition-all font-medium text-slate-700 dark:text-white appearance-none cursor-pointer text-sm"
                  >
                    <option value="all">Todas as Aulas</option>
                    {classTypes.map((type, idx) => (
                       <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               </div>

               <div className="relative min-w-[180px] flex-1 md:flex-none">
                  <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full pl-11 pr-10 py-3 bg-white dark:bg-dark-surface rounded-xl focus:outline-none focus:bg-slate-50 dark:focus:bg-dark-hover transition-all font-medium text-slate-700 dark:text-white appearance-none cursor-pointer text-sm"
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="oldest">Mais Antigas</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               </div>
           </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl overflow-hidden min-h-[400px]">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-dark-element/50 text-xs uppercase tracking-wider text-slate-400 font-bold">
                     <th className="px-6 py-5 whitespace-nowrap">Início</th>
                     <th className="px-6 py-5 whitespace-nowrap">Término</th>
                     <th className="px-6 py-5">Aula Aplicada</th>
                     <th className="px-6 py-5">Professor</th>
                     <th className="px-6 py-5">Alunos</th>
                     <th className="px-6 py-5 text-center">Status</th>
                     <th className="px-6 py-5 text-center">Nota</th>
                  </tr>
               </thead>
               <tbody className="text-sm font-medium">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((entry, index) => {
                      const isApproved = entry.verdict.toLowerCase().includes('aprovado');
                      const hasAdminActivity = entry.adminActivity.toLowerCase().includes('sim') || entry.adminActivity.toLowerCase().includes('entregue');
                      
                      return (
                         <tr key={index} className="group hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                            <td className="px-6 py-5 text-slate-500 whitespace-nowrap font-mono text-xs">
                               <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-slate-400" />
                                  {entry.startTime}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-slate-500 whitespace-nowrap font-mono text-xs">
                               <div className="flex items-center gap-2">
                                  <CalendarDays size={12} className="text-slate-400" />
                                  {entry.endTime}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-slate-800 dark:text-slate-200">
                               <div className="flex flex-col">
                                  <span className="font-semibold">{entry.className}</span>
                                  {hasAdminActivity && (
                                     <span className="text-[10px] text-brand flex items-center gap-1 mt-0.5">
                                        <FileCheck size={10} /> Atividade
                                     </span>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                               {entry.professor}
                            </td>
                            <td className="px-6 py-5 text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={entry.students}>
                               {entry.students}
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex justify-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                        ${isApproved 
                                            ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10' 
                                            : 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10'
                                        }`}
                                    >
                                        {isApproved ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {entry.verdict}
                                    </span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-center font-bold text-slate-700 dark:text-white">
                               {entry.score}
                            </td>
                         </tr>
                      );
                    })
                  ) : (
                    <tr>
                       <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                          Nenhum registro encontrado.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
