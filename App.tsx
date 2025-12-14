import React, { useState, useEffect } from 'react';
import { CLASSES, ClassCategory, ContentBlock, User, ViewState } from './types.ts';
import { loginUser, fetchClassContent } from './services/sheetService.ts';
import { parseRowsToBlocks } from './components/ContentParser.ts';
import { ContentRenderer } from './components/ContentRenderer.tsx';
import { ClassFeedbackForm } from './components/ClassFeedbackForm.tsx';
import { ClassHistoryList } from './components/ClassHistoryList.tsx';
import { EligibilityChecker } from './components/EligibilityChecker.tsx';
import { CorrectionTool } from './components/CorrectionTool.tsx';
import { Navbar } from './components/Navbar.tsx';
import { 
  LogIn, 
  ShieldCheck, 
  BookOpen, 
  Target,
  Loader2,
  Sun,
  Moon,
  X,
  ArrowLeft,
  ChevronRight,
  Send,
  Home,
  LogOut,
  Folder,
  ChevronDown,
  ChevronUp,
  FileText,
  ClipboardList,
  Search,
  PenTool,
  Book,
  Scale,
  Gavel,
  ShieldAlert,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';

interface ReportData {
  classId: string;
  startTime: Date;
  studentNick?: string;
}

const LOGO_URL = "https://i.imgur.com/ScdmxL5.png";

const getRoleLevel = (role: string) => {
  const r = role.toLowerCase();
  if (['líder', 'lider', 'vice-líder', 'vice-lider', 'conselheiro', 'estagiário', 'estagiario'].some(x => r.includes(x))) return 4;
  if (r.includes('fiscalizador')) return 3;
  if (r.includes('avaliador')) return 2;
  return 1; 
}

interface SidebarItemDef {
  id: ViewState;
  label: string;
  icon: any;
}

interface SidebarFolder {
  id: string;
  label: string;
  minLevel: number;
  items: SidebarItemDef[];
}

const SIDEBAR_STRUCTURE: SidebarFolder[] = [
  {
    id: 'professores',
    label: 'Professores',
    minLevel: 1,
    items: [
      { id: 'classes', label: 'Aulas', icon: BookOpen },
      { id: 'reports', label: 'Formulário de Postagem', icon: FileText },
      { id: 'history', label: 'Relatórios de Aulas', icon: ClipboardList },
      { id: 'correction', label: 'Ferramenta de Correção', icon: PenTool },
      { id: 'manual_prof', label: 'Manual de Função', icon: Book },
    ]
  },
  {
    id: 'avaliadores',
    label: 'Avaliadores',
    minLevel: 2,
    items: [
      { id: 'evaluations', label: 'Avaliações', icon: Scale },
      { id: 'eval_reports', label: 'Formulário de Postagem', icon: FileText },
      { id: 'eval_history', label: 'Relatório de Avaliações', icon: ClipboardList },
      { id: 'manual_eval', label: 'Manual de Função', icon: Book },
    ]
  },
  {
    id: 'fiscalizadores',
    label: 'Fiscalizadores',
    minLevel: 3,
    items: [
      { id: 'eligibility', label: 'Verificação de Elegibilidade', icon: Search },
      { id: 'audit_reports', label: 'Formulário de Postagem', icon: FileText },
      { id: 'audit_history', label: 'Relatório de Fiscalizações', icon: ClipboardList },
      { id: 'manual_audit', label: 'Manual de Funções', icon: Book },
    ]
  }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved === 'dark' || saved === 'light') ? saved : 'light';
    }
    return 'light';
  });
  
  const [nicknameInput, setNicknameInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['professores']));

  const [selectedClass, setSelectedClass] = useState<ClassCategory | null>(null);
  const [classContent, setClassContent] = useState<ContentBlock[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [classStartTime, setClassStartTime] = useState<Date | null>(null);

  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const root = document.getElementById('prof-dashboard-root') || window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    setLoginLoading(true);
    setLoginError('');

    try {
      const user = await loginUser(nicknameInput);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setLoginError('Nickname não encontrado no registro.');
      }
    } catch (err) {
      setLoginError('Erro ao conectar com a planilha. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'reports') {
        setReportData(null);
    }
    setSelectedClass(null); 
    setMobileMenuOpen(false);
  };

  const openClass = async (cls: ClassCategory) => {
    setSelectedClass(cls);
    const now = new Date();
    setClassStartTime(now);
    setContentLoading(true);
    setClassContent([]);

    try {
      const rawRows = await fetchClassContent(cls.gid);
      const parsedBlocks = parseRowsToBlocks(rawRows);
      setClassContent(parsedBlocks);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar conteúdo da aula.');
    } finally {
      setContentLoading(false);
    }
  };

  const handlePostReport = () => {
    if (selectedClass && classStartTime) {
        setReportData({
            classId: selectedClass.id,
            startTime: classStartTime
        });
        setCurrentView('reports');
        setSelectedClass(null);
    }
  };

  const handleNavigateFromCorrection = (studentNick: string) => {
     setReportData({
        classId: 'admin_activity', 
        startTime: new Date(),
        studentNick: studentNick
     });
     setCurrentView('reports');
  };

  const backToClassList = () => {
    setSelectedClass(null);
    setClassStartTime(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setNicknameInput('');
    setSelectedClass(null);
    setClassStartTime(null);
    setReportData(null);
    setCurrentView('home');
    setExpandedFolders(new Set(['professores']));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
        const next = new Set(prev);
        if (next.has(folderId)) next.delete(folderId);
        else next.add(folderId);
        return next;
    });
  };

  const getIconForClass = (id: string) => {
    switch (id) {
      case 'admin': return <ShieldCheck size={24} />;
      case 'mil_sci': return <BookOpen size={24} />;
      case 'mil_career': return <Target size={24} />;
      case 'practice': return <Gavel size={24} />; 
      default: return <BookOpen size={24} />;
    }
  };

  const getPageTitle = () => {
    if (selectedClass) return selectedClass.name;
    const allItems = SIDEBAR_STRUCTURE.flatMap(f => f.items);
    const item = allItems.find(i => i.id === currentView);
    if (item) return item.label;
    if (currentView === 'home') return 'Início';
    return 'Painel';
  };

  const getRoleShortcut = () => {
    if (!currentUser) return null;
    const level = getRoleLevel(currentUser.role);
    
    if (level === 3) return { label: 'Ir para Fiscalização', view: 'eligibility' as ViewState };
    if (level === 2) return { label: 'Ir para Avaliações', view: 'evaluations' as ViewState };
    return { label: 'Ir para Aulas', view: 'classes' as ViewState };
  }

  const Sidebar = ({ compact = false }: { compact?: boolean }) => {
      const userLevel = currentUser ? getRoleLevel(currentUser.role) : 0;
      
      return (
        <div className="flex flex-col w-full h-full">
            <div className="px-3 pt-4 pb-2">
                 <button
                    onClick={() => navigateTo('home')}
                    className={`flex items-center w-full px-4 py-3 rounded-2xl transition-all font-semibold text-sm
                        ${currentView === 'home' 
                            ? 'bg-brand text-white' 
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-hover'}
                    `}
                >
                    <LayoutDashboard size={20} className={currentView === 'home' ? 'text-white' : 'text-slate-400'} />
                    {!compact && <span className="ml-3">Início</span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-6 mt-2">
                {SIDEBAR_STRUCTURE.map(folder => {
                    if (userLevel < folder.minLevel) return null;
                    const isOpen = expandedFolders.has(folder.id);

                    return (
                        <div key={folder.id}>
                            {!compact ? (
                                <button 
                                    onClick={() => toggleFolder(folder.id)}
                                    className="flex items-center justify-between w-full px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span>{folder.label}</span>
                                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            ) : (
                                <div className="flex justify-center py-2 text-slate-400" title={folder.label}>
                                    <Folder size={20} />
                                </div>
                            )}

                            {(!compact && isOpen) && (
                                <div className="space-y-1">
                                    {folder.items.map(item => {
                                        const isActive = currentView === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => navigateTo(item.id)}
                                                className={`flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                                    ${isActive
                                                        ? 'bg-brand/10 text-brand dark:bg-brand/20'
                                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-hover'}
                                                `}
                                            >
                                                <item.icon size={18} className={isActive ? 'text-brand' : 'opacity-70'} />
                                                <span className="ml-3">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {!compact && (
                <div className="p-4 mt-auto space-y-2">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all text-sm font-medium"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                    <button 
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-3 w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-dark-element dark:text-slate-400 rounded-xl transition-all text-sm font-medium"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span>Alternar Tema</span>
                    </button>
                </div>
            )}
        </div>
      );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-3xl p-8 relative z-10 animate-fade-in shadow-2xl">
          <div className="text-center mb-10">
            <div className="flex flex-col items-center justify-center gap-4 mb-2">
                <img src={LOGO_URL} alt="ProfHub Banner" className="h-16 object-contain" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Identificação</label>
              <div className="relative group">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={20} />
                <input
                  id="nickname"
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-dark-element focus:bg-slate-100 dark:focus:bg-dark-hover focus:outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 text-sm"
                  placeholder="Seu Nickname"
                  autoComplete="off"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl flex items-center gap-3 animate-fade-in">
                <ShieldCheck size={16} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
            >
              {loginLoading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              {loginLoading ? 'Verificando...' : 'Acessar Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full font-sans transition-colors duration-300">
      
      <aside className="w-72 bg-white dark:bg-dark-surface fixed h-full z-[999] hidden lg:flex flex-col border-r border-slate-200/50 dark:border-white/5">
        <div className="h-24 flex items-center gap-3 px-8 shrink-0">
           <img src={LOGO_URL} alt="Logo" className="w-8 h-auto object-contain" />
           <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Painel</span>
        </div>
        <div className="flex-1 min-h-0">
           <Sidebar />
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-dark-surface flex flex-col animate-fade-in shadow-2xl">
             <div className="h-20 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <img src={LOGO_URL} alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="font-bold">Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}><X size={20} className="text-slate-500" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-4">
                <Sidebar />
             </div>
          </div>
        </div>
      )}

      {/* FIXED: Removed transition-all duration-300 from here to prevent layout jumps, ensured w-full */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full">
        
        <Navbar 
          user={currentUser} 
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
          title={getPageTitle()}
        />

        <main className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          
          {currentView === 'home' && (
            <div className="animate-fade-in">
               <div className="rounded-3xl p-8 lg:p-12 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-slate-900/80"></div>

                  <div className="relative z-10 max-w-2xl">
                     <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Olá, {currentUser?.nickname}</h2>
                     <p className="text-slate-200 text-sm lg:text-base leading-relaxed mb-8 opacity-90">
                       Acesse as pastas no menu lateral para gerenciar suas atividades conforme seu cargo ({currentUser?.role}).
                     </p>
                     
                     {(() => {
                        const shortcut = getRoleShortcut();
                        if (shortcut) {
                            return (
                                <button 
                                    onClick={() => navigateTo(shortcut.view)}
                                    className="px-6 py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center gap-2 group/btn"
                                >
                                    {shortcut.label} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            );
                        }
                        return null;
                     })()}
                  </div>
               </div>
            </div>
          )}

          {currentView === 'classes' && !selectedClass && (
             <div className="animate-fade-in">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Catálogo de Aulas</h2>
                    <p className="text-slate-500 text-sm">Selecione uma categoria para iniciar.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => openClass(cls)}
                      className="group relative bg-white dark:bg-dark-surface p-6 rounded-3xl text-left flex items-start gap-5 w-full hover:bg-white dark:hover:bg-dark-hover hover:scale-[1.01] transition-all duration-200"
                    >
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-brand/10 dark:bg-dark-element text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                         {React.cloneElement(getIconForClass(cls.id) as any, { size: 28 })}
                      </div>
                      <div className="flex-1 flex flex-col h-full min-w-0">
                         <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight mb-2 truncate">
                              {cls.name}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                              {cls.description}
                            </p>
                         </div>
                         <div className="mt-4 pt-4 flex items-center justify-end">
                            <div className="flex items-center text-xs font-bold text-slate-300 group-hover:text-brand transition-colors">
                                Abrir <ChevronRight size={14} className="ml-1" />
                            </div>
                         </div>
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          )}

          {currentView === 'classes' && selectedClass && (
            <div className="animate-fade-in pb-10">
               <div className="flex items-center justify-between mb-6">
                 <button 
                   onClick={backToClassList}
                   className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors font-medium text-sm"
                 >
                   <ArrowLeft size={16} /> Voltar
                 </button>

                 <button
                    onClick={handlePostReport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover transition-all"
                 >
                    <Send size={16} />
                    Concluir Aula
                 </button>
               </div>

               {contentLoading ? (
                 <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-surface rounded-3xl">
                   <Loader2 className="animate-spin text-brand mb-4" size={40} />
                   <p className="text-slate-400 font-medium animate-pulse text-sm uppercase tracking-wide">Carregando script...</p>
                 </div>
               ) : (
                 <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 lg:p-10 min-h-[500px]">
                    {classContent.length > 0 ? (
                      <ContentRenderer blocks={classContent} />
                    ) : (
                      <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p>Conteúdo indisponível no momento.</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {currentView === 'reports' && currentUser && (
             <div className="animate-fade-in max-w-4xl mx-auto">
                <ClassFeedbackForm 
                    professor={currentUser}
                    initialClassId={reportData?.classId}
                    initialStartTime={reportData?.startTime}
                    initialStudent={reportData?.studentNick}
                />
             </div>
          )}

          {currentView === 'history' && currentUser && (
             <div className="animate-fade-in max-w-6xl mx-auto">
                <ClassHistoryList currentUser={currentUser} />
             </div>
          )}

          {currentView === 'correction' && currentUser && (
             <CorrectionTool 
                currentUser={currentUser} 
                onNavigateToReport={handleNavigateFromCorrection}
             />
          )}

          {currentView === 'eligibility' && currentUser && (
              <EligibilityChecker currentUser={currentUser} />
          )}

          {['manual_prof', 'evaluations', 'eval_reports', 'eval_history', 'manual_eval', 'audit_reports', 'audit_history', 'manual_audit'].includes(currentView) && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div className="bg-white dark:bg-dark-surface p-10 rounded-full mb-6">
                    <ShieldAlert size={48} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Em Desenvolvimento</h3>
                  <p className="text-slate-500 max-w-md">
                      Esta ferramenta ({currentView}) ainda está sendo implementada no sistema.
                  </p>
              </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;