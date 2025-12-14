import React, { useState } from 'react';
import { User } from '../types.ts';
import { CheckCircle2, XCircle, Search, Eraser, AlertCircle, Code, MessageSquare, Globe, FileText } from 'lucide-react';

interface CorrectionToolProps {
  currentUser: User;
  onNavigateToReport: (studentNick: string) => void;
}

const REQUIRED_TAGS = [
  '[/b]', 
  '[/i]', 
  '[/u]', 
  '[/strike]', 
  '[/code]', 
  '[/spoiler]', 
  '[/table]', 
  '[/img]', 
  '[/font]', 
  '[url=', 
  '[size=', 
  '[color='
];

export const CorrectionTool: React.FC<CorrectionToolProps> = ({ currentUser, onNavigateToReport }) => {
  const [studentNick, setStudentNick] = useState('');
  const [bbcodeInput, setBbcodeInput] = useState('');
  const [result, setResult] = useState<{ approved: boolean; missing: string[]; checked: boolean }>({ 
    approved: false, 
    missing: [], 
    checked: false 
  });

  const handleCheck = () => {
    if (!bbcodeInput.trim()) return;

    const missingTags = REQUIRED_TAGS.filter(tag => !bbcodeInput.includes(tag));
    
    setResult({
      approved: missingTags.length === 0,
      missing: missingTags,
      checked: true
    });
  };

  const handleClear = () => {
    setStudentNick('');
    setBbcodeInput('');
    setResult({ approved: false, missing: [], checked: false });
  };

  const handleForumPost = () => {
      alert("Redirecionando para o tópico de postagem no fórum (Simulação).");
  };

  const handleMpSend = () => {
      alert(`Redirecionando para enviar MP para ${studentNick || 'o aluno'}.`);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ferramenta de Correção</h2>
         <p className="text-slate-500 text-sm">Validação automática de atividades de Administração.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Professor</label>
                        <div className="w-full px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed">
                            {currentUser.nickname}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Aluno</label>
                        <input 
                            type="text" 
                            value={studentNick}
                            onChange={(e) => setStudentNick(e.target.value)}
                            placeholder="Nickname do aluno"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white text-slate-700 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Conteúdo BBCode</label>
                    <textarea 
                        value={bbcodeInput}
                        onChange={(e) => {
                            setBbcodeInput(e.target.value);
                            if (result.checked) setResult({ ...result, checked: false });
                        }}
                        placeholder="Cole o código da atividade aqui..."
                        className="w-full p-5 h-64 bg-slate-50 dark:bg-dark-element rounded-2xl focus:bg-slate-100 dark:focus:bg-dark-hover outline-none transition-all dark:text-white font-mono text-sm resize-none"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <button 
                        onClick={handleCheck}
                        disabled={!bbcodeInput.trim()}
                        className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search size={20} />
                        Corrigir Atividade
                    </button>
                    <button 
                        onClick={handleClear}
                        className="px-6 bg-slate-100 dark:bg-dark-element hover:bg-slate-200 dark:hover:bg-dark-hover text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all"
                        title="Limpar campos"
                    >
                        <Eraser size={20} />
                    </button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            {result.checked ? (
                <div className={`h-full rounded-3xl p-8 flex flex-col justify-between animate-fade-in
                    ${result.approved 
                        ? 'bg-green-50 dark:bg-green-900/10' 
                        : 'bg-red-50 dark:bg-red-900/10'}
                `}>
                    <div className={`flex flex-col items-center text-center 
                         ${result.approved ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}
                    `}>
                        <div className={`p-4 rounded-full mb-6 ${result.approved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            {result.approved ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2">
                            {result.approved ? 'APROVADO' : 'REPROVADO'}
                        </h3>
                        
                        <p className="text-sm font-medium opacity-80 mb-6">
                            {result.approved 
                                ? 'Todas as tags obrigatórias foram encontradas.' 
                                : 'Faltam tags obrigatórias no código.'}
                        </p>

                        {!result.approved && result.missing.length > 0 && (
                            <div className="w-full bg-white/50 dark:bg-black/20 rounded-xl p-4 text-left">
                                <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70 flex items-center gap-2">
                                    <AlertCircle size={12} /> Tags Ausentes
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 rounded text-xs font-mono font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="h-px bg-black/5 dark:bg-white/5 w-full mb-4"></div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 text-center">Ações Rápidas</h4>
                        
                        <button 
                            onClick={handleForumPost}
                            className="w-full py-3 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-700 dark:text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Globe size={16} /> Postar no Fórum
                        </button>
                        
                        <button 
                            onClick={handleMpSend}
                            className="w-full py-3 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-700 dark:text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                            <MessageSquare size={16} /> Enviar MP
                        </button>

                        <button 
                            onClick={() => onNavigateToReport(studentNick)}
                            className="w-full py-3 bg-brand text-white hover:bg-brand-hover font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
                        >
                            <FileText size={16} /> Postar no Formulário
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full bg-slate-100 dark:bg-dark-surface rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-dark-element">
                    <Code size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Cole o código e clique em corrigir para ver o resultado.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};