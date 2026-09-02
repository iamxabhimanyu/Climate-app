import React from 'react';
import { Home, Activity, Luggage, Bot, Settings, LucideIcon } from 'lucide-react';

export type AppTab = 'home' | 'insights' | 'travel' | 'ai' | 'settings';

interface BottomNavBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  unreadAlertCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'insights', label: 'Insights', icon: Activity },
    { id: 'travel', label: 'Explore', icon: Luggage },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-[#030712]/92 border-t border-white/[0.08] px-1.5 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 min-w-[50px] min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-200 relative group active:scale-95 cursor-pointer touch-manipulation select-none ${
                isActive
                  ? 'text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top indicator */}
              {isActive && (
                <div className="absolute -top-1.5 w-7 h-1 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-sky-500/20 shadow-inner'
                    : 'group-hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-[10px] min-[375px]:text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-white' : 'font-medium opacity-70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
