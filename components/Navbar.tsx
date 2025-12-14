import React from 'react';
import { User } from '../types.ts';
import { Menu, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onMenuClick, onLogout, title }) => {
  const getHabboAvatar = (nickname: string) => 
    `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${nickname}&direction=3&head_direction=3&gesture=sml&size=m&headonly=1`;

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md shadow-sm sticky top-0 z-[900] px-4 lg:px-8 flex items-center justify-between transition-all duration-300 border-b border-slate-200/50 dark:border-white/5">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  {user.nickname}
                </p>
                <p className="text-[10px] text-brand font-bold uppercase tracking-wide leading-tight mt-0.5">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 dark:bg-dark-element rounded-full overflow-hidden flex items-center justify-center relative shadow-sm border border-slate-200 dark:border-slate-700">
                 <img 
                  src={getHabboAvatar(user.nickname)} 
                  alt={user.nickname} 
                  className="w-full h-full object-cover -mt-2 scale-125"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};