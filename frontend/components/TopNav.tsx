"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, ShieldAlert, LogOut } from "lucide-react";
import { useAuth, USERS, Role } from "@/contexts/AuthContext";

export default function TopNav() {
  const { user, switchRole, logout } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleSwitcher(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabels: Record<Role, string> = {
    specialist: "AP Specialist",
    admin: "System Administrator"
  };

  return (
    <header className="h-16 bg-[#0a1128] border-b border-gray-800 flex items-center justify-end px-6 sticky top-0 z-50 w-full transition-all">
      <div className="flex items-center gap-4 ml-4 shrink-0">
        
        <div className="h-8 w-px bg-gray-700 mx-2"></div>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white flex items-center gap-1 justify-end">
                {user.name} <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="text-xs text-gray-400">{roleLabels[user.role]}</div>
            </div>
            <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-blue-600 border border-blue-400">
               {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="flex h-full w-full items-center justify-center font-bold text-white text-xs">{user.initials}</span>
               )}
            </div>
          </div>

          {/* Role Switcher Dropdown (Demo Mode) */}
          {showRoleSwitcher && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-blue-600/10 border-b border-blue-600/20 p-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert size={12} /> Demo Mode
                </span>
                <span className="text-[10px] text-slate-400">Role Switcher</span>
              </div>
              <div className="p-1.5">
                {(Object.entries(USERS) as [Role, typeof user][]).map(([roleKey, u]) => (
                  <button
                    key={roleKey}
                    onClick={() => { switchRole(roleKey); setShowRoleSwitcher(false); }}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-md transition-colors ${user.role === roleKey ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 overflow-hidden rounded-full flex items-center justify-center text-[10px] font-bold ${user.role === roleKey ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                        ) : (
                          u.initials
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{roleLabels[roleKey]}</div>
                      </div>
                    </div>
                    {user.role === roleKey && <Check size={16} className="text-blue-400" />}
                  </button>
                ))}
                
                <div className="h-px bg-slate-800 my-1.5"></div>
                
                <button
                  onClick={() => { logout(); setShowRoleSwitcher(false); }}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-md transition-colors text-red-400 hover:bg-slate-800"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
