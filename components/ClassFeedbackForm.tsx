import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { Copy, Check, Calculator, ChevronDown, ToggleLeft, ToggleRight, FileCheck } from 'lucide-react';

interface ClassFeedbackFormProps {
  professor: User;
  initialClassId?: string;
  initialStartTime?: Date | null;
  initialStudent?: string;
}

const CLASS_TYPES = [
  { id: 'admin', name: 'Administração e Tecnologia do Fórum', maxScore: 6 },
  { id: 'mil_sci', name: 'Ciências Militares', maxScore: 5 },
  { id: 'mil_career', name: 'Carreira Militar', maxScore: 5 },
  { id: 'practice', name: 'Práticas Militares e Legislação', maxScore: 4 },
];

export const ClassFeedbackForm: React.FC<ClassFeedbackFormProps> = ({ 
  professor, 
  initialClassId, 
  initialStartTime,
  initialStudent
}) => {
  const [selectedType, setSelectedType] = useState(CLASS_TYPES[0]);
  
  const [isAdminActivity, setIsAdminActivity] = useState(false);
  const [activitySubmitted, setActivitySubmitted] = useState<'Sim' | 'Não'>('Sim');

  const [students, setStudents] = useState('');
  const [verdict, setVerdict] = useState<'Aprovado' | 'Reprovado'>('Aprovado');
  const [score, setScore] = useState<string>('');
  const [comments, setComments] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [startTime, setStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if (initialClassId) {
      const type = CLASS_TYPES.find(t => t.id === initialClassId) || CLASS_TYPES[0];
      setSelectedType(type);
      if (initialClassId === 'admin_activity') {
        const adminType = CLASS_TYPES.find(t => t.id === 'admin');
        if (adminType) setSelectedType(adminType);
        setIsAdminActivity(true);
      }
    }
    
    if (initialStartTime) {
      setStartTime(initialStartTime);
    } else {
      setStartTime(new Date());
    }

    if (initialStudent) {
        setStudents(initialStudent);
    }
  }, [initialClassId, initialStartTime, initialStudent]);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      if (val === '') {
        setScore('');
        return;
      }
      const num = parseInt(val, 10);
      if (num >= 0 && num <= selectedType.maxScore) {
        setScore(val);
      }
    }
  };

  const formatDateTimeForInput = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
          setStartTime(new Date(e.target.value));
      }
  };

  const formatReport = () => {
    const scoreLine = isAdminActivity 
        ? `Atividade Enviada: ${activitySubmitted.toUpperCase()}`
        : `Pontuação: ${score}/${selectedType.maxScore}`;

    const typeName = isAdminActivity 
        ? `${selectedType.name} (Atividade)` 
        : selectedType.name;

    return `
RELATÓRIO DE AULA - ${typeName}
----------------------------------------
Professor: ${professor.nickname}
Alunos: ${students}
Início: ${startTime.toLocaleString('pt-BR')}
Fim: ${new Date().toLocaleString('pt-BR')}

Veredito: ${verdict.toUpperCase()}
${scoreLine}

Comentários:
${comments}
----------------------------------------
`.trim();
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(formatReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Relatório</h3>
           <p className="text-slate-500">Preenchimento de dados da aula.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 bg-white dark:bg-dark-surface rounded-3xl p-8">
           
           <div className="space-y-3 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo de Aula</label>
                <div className="relative">
                <select
                    value={selectedType.id}
                    onChange={(e) => {
                    const newType = CLASS_TYPES.find(t => t.id === e.target.value);
                    if (newType) {
                        setSelectedType(newType);
                        setScore('');
                        if (newType.id !== 'admin') setIsAdminActivity(false);
                    }
                    }}
                    className="w-full appearance-none px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white font-medium text-slate-700 cursor-pointer"
                >
                    {CLASS_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
           </div>

           {selectedType.id === 'admin' && (
                <div className="mb-8 p-4 bg-slate-50 dark:bg-dark-element rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Registro</span>
                    <div className="flex bg-white dark:bg-dark-surface p-1 rounded-xl">
                        <button
                            onClick={() => setIsAdminActivity(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isAdminActivity ? 'bg-brand text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Registro de Aula
                        </button>
                        <button
                            onClick={() => setIsAdminActivity(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isAdminActivity ? 'bg-brand text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Registro de Atividade
                        </button>
                    </div>
                </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Alunos Participantes</label>
                 <input 
                    type="text" 
                    value={students}
                    onChange={(e) => setStudents(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white text-slate-700 font-medium"
                    placeholder="Ex: Nick1, Nick2..."
                 />
              </div>

              <div className="space-y-3">
                {isAdminActivity ? (
                    <>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Enviou Atividade?</label>
                        <div className="relative">
                            <select
                                value={activitySubmitted}
                                onChange={(e) => setActivitySubmitted(e.target.value as 'Sim' | 'Não')}
                                className="w-full appearance-none px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white font-bold text-slate-700 cursor-pointer"
                            >
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </>
                ) : (
                    <>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Pontuação (Max: {selectedType.maxScore})</label>
                        <div className="relative">
                            <input 
                            type="number" 
                            value={score}
                            onChange={handleScoreChange}
                            min="0"
                            max={selectedType.maxScore}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white font-bold text-slate-700"
                            placeholder="0"
                            />
                            <Calculator className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </>
                )}
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Observações</label>
              <textarea 
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full p-5 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white resize-none text-slate-700 leading-relaxed font-medium"
                placeholder="Observações pertinentes sobre a aula ou alunos..."
              />
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-dark-surface rounded-3xl p-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Veredito</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVerdict('Aprovado')}
                  className={`py-4 rounded-xl font-bold text-sm transition-all ${
                    verdict === 'Aprovado' 
                      ? 'bg-brand text-white' 
                      : 'bg-slate-50 dark:bg-dark-element text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover'
                  }`}
                >
                  Aprovado
                </button>
                <button
                  onClick={() => setVerdict('Reprovado')}
                  className={`py-4 rounded-xl font-bold text-sm transition-all ${
                    verdict === 'Reprovado' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-50 dark:bg-dark-element text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover'
                  }`}
                >
                  Reprovado
                </button>
              </div>
           </div>

           <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-400 uppercase">Professor</span>
                 <span className="font-bold text-slate-700 dark:text-white text-sm bg-slate-50 dark:bg-dark-element px-3 py-1 rounded-lg">{professor.nickname}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Início</span>
                 <div className="relative">
                     <input 
                        type="datetime-local" 
                        value={formatDateTimeForInput(startTime)}
                        onChange={handleStartTimeChange}
                        className="w-full font-bold text-slate-700 dark:text-white text-sm bg-slate-50 dark:bg-dark-element px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 transition-all appearance-none cursor-pointer"
                     />
                 </div>
              </div>
           </div>

           <button
             onClick={handleCopyReport}
             className="w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-3xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
           >
             {copied ? <Check size={20} className="text-brand" /> : <Copy size={20} />}
             {copied ? 'Copiado!' : 'Copiar Relatório'}
           </button>
        </div>

      </div>
    </div>
  );
};
