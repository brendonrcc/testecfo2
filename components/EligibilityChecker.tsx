import React, { useState, useEffect, useMemo } from 'react';
import { fetchClassHistory } from '../services/sheetService.ts';
import { ClassHistoryEntry, User } from '../types.ts';
import { Loader2, Search, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EligibilityCheckerProps {
  currentUser?: User;
}

const CLASS_HIERARCHY = ['admin', 'mil_sci', 'mil_career', 'practice'];

const mapSheetNameToId = (name: string): string => {
  const n = name.toLowerCase();
  if ((n.includes('práticas') || n.includes('praticas')) && (n.includes('legislação') || n.includes('legislacao'))) return 'practice';
  if (n.includes('práticas') || n.includes('praticas')) return 'practice';
  if (n.includes('carreira')) return 'mil_career';
  if (n.includes('ciências') || n.includes('ciencias')) return 'mil_sci';
  if (n.includes('administração') || n.includes('administracao')) return 'admin';
  return 'unknown';
};

const mapIdToName = (id: string) => {
    switch(id) {
        case 'admin': return 'Administração e Tecnologia do Fórum';
        case 'mil_sci': return 'Ciências Militares';
        case 'mil_career': return 'Carreira Militar';
        case 'practice': return 'Práticas Militares e Legislação';
        case 'final_exam': return 'Habilitado ao exame final';
        default: return 'Desconhecido';
    }
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

type ValidationResult = {
    status: 'success' | 'warning' | 'error' | 'idle';
    message: string;
    nextClass?: string;
};

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({ currentUser }) => {
  const [history, setHistory] = useState<ClassHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [checkNick, setCheckNick] = useState('');
  const [manualCheckResult, setManualCheckResult] = useState<ValidationResult | null>(null);

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

  const validateEntry = (latestEntry: ClassHistoryEntry, fullStudentHistory: ClassHistoryEntry[]): ValidationResult => {
      const lastClassId = mapSheetNameToId(latestEntry.className);
      const isLastApproved = latestEntry.verdict.toLowerCase().includes('aprovado');

      if (!isLastApproved) {
          return {
              status: 'warning', 
              message: 'Refazer',
              nextClass: latestEntry.className
          };
      }

      let nextRequiredId = 'final_exam';
      
      for (const stepId of CLASS_HIERARCHY) {
          const stepEntries = fullStudentHistory.filter(h => mapSheetNameToId(h.className) === stepId);
          const sortedStepEntries = stepEntries.sort((a, b) => {
              const tA = parseDate(a.endTime)?.getTime() || 0;
              const tB = parseDate(b.endTime)?.getTime() || 0;
              return tB - tA;
          });

          const latestStepAttempt = sortedStepEntries[0];

          if (!latestStepAttempt || !latestStepAttempt.verdict.toLowerCase().includes('aprovado')) {
              nextRequiredId = stepId;
              break;
          }
      }

      if (nextRequiredId === 'final_exam') {
          return { status: 'success', message: 'Habilitado ao exame final', nextClass: 'Exame Final' };
      }

      const nextClassName = mapIdToName(nextRequiredId);
      const lastTime = parseDate(latestEntry.endTime);
      if (!lastTime) return { status: 'error', message: 'Erro na data' };
      
      const now = new Date();
      const diffHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);

      if (lastClassId !== 'admin') {
          if (diffHours < 1) {
              const waitMin = Math.ceil(60 - (diffHours * 60));
              return {
                  status: 'error',
                  message: `Aguarde: ${waitMin} min`,
                  nextClass: nextClassName
              };
          }
      }

      if (currentUser && latestEntry.professor.toLowerCase().trim() === currentUser.nickname.toLowerCase().trim()) {
          if (diffHours < 24) {
              const remainingHours = 24 - diffHours;
              const h = Math.floor(remainingHours);
              const m = Math.ceil((remainingHours - h) * 60);
              
              return {
                  status: 'error',
                  message: `Mesmo Prof: ${h}h ${m}m`,
                  nextClass: nextClassName
              };
          }
      }

      return {
          status: 'success',
          message: `Próx: ${nextClassName}`, 
          nextClass: nextClassName
      };
  };

  const handleCheckStudent = () => {
    if (!checkNick.trim()) return;
    const nick = checkNick.toLowerCase().trim();
    
    const studentLogs = history
        .filter(h => h.students.toLowerCase().includes(nick))
        .sort((a, b) => {
            const dateA = parseDate(a.endTime);
            const dateB = parseDate(b.endTime);
            return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });

    if (studentLogs.length === 0) {
        setManualCheckResult({
            status: 'success',
            message: 'Início: Administração e Tecnologia do Fórum',
            nextClass: 'Administração e Tecnologia do Fórum'
        });
        return;
    }

    const res = validateEntry(studentLogs[0], studentLogs);
    setManualCheckResult(res);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand mb-4" size={32} />
        <p className="text-slate-400 font-medium text-sm tracking-wide">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
       <div className="flex flex-col gap-2">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Verificação de Elegibilidade</h2>
         <p className="text-slate-500 text-sm">Ferramenta exclusiva para fiscalizadores.</p>
       </div>

      <div className="bg-slate-900 dark:bg-brand/10 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-lg"><Search size={20} className="text-brand-subtle" /></div>
                <h3 className="text-lg font-bold">Consultar Aluno</h3>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full relative">
                    <input 
                        type="text" 
                        value={checkNick}
                        onChange={(e) => setCheckNick(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckStudent()}
                        placeholder="Nickname do aluno..."
                        className="w-full pl-5 pr-4 py-3.5 bg-white/10 rounded-xl focus:outline-none focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 text-sm"
                    />
                </div>
                <button 
                    onClick={handleCheckStudent}
                    disabled={!checkNick}
                    className="px-6 py-3.5 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                >
                    Verificar
                </button>
             </div>

             {manualCheckResult && (
                 <div className={`mt-6 p-4 rounded-xl flex items-center gap-4 animate-fade-in border
                    ${manualCheckResult.status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : ''}
                    ${manualCheckResult.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : ''}
                    ${manualCheckResult.status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                 `}>
                    {manualCheckResult.status === 'success' && <CheckCircle2 size={24} className="text-green-400" />}
                    {manualCheckResult.status === 'warning' && <AlertTriangle size={24} className="text-yellow-400" />}
                    {manualCheckResult.status === 'error' && <AlertCircle size={24} className="text-red-400" />}
                    <div className="font-medium">
                        {manualCheckResult.message}
                    </div>
                 </div>
             )}
         </div>

         <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[100px] rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
};