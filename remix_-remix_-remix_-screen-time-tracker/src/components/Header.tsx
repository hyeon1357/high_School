import { Smartphone, LogOut, GraduationCap, Award } from "lucide-react";
import { UserInfo } from "../types";

interface HeaderProps {
  userInfo?: UserInfo | null;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

export default function Header({ userInfo, onLogout, onLogoClick }: HeaderProps) {
  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-900/40 backdrop-blur-md px-4 py-4 md:px-8 shadow-sm" id="tracker-header">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div 
          onClick={onLogoClick}
          className={`flex items-center gap-3 ${onLogoClick ? "cursor-pointer hover:opacity-85 select-none transition-all" : ""}`}
          title={onLogoClick ? "맨 앞 화면으로 이동" : undefined}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/10">
            <Smartphone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              ScreenTime <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Tracker</span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans">전학년 실시간 랭킹 및 평균 사용 시간 대시보드 <span className="text-amber-400 font-semibold">(6/21 ~ 6/27 측정 주간)</span></p>
          </div>
        </div>

        {userInfo && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/60 border border-neutral-850/80 text-xs">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-neutral-200 font-medium">
                {userInfo.grade}학년 {userInfo.classGroup}반 {userInfo.number}번
              </span>
              {userInfo.name && userInfo.name.trim() !== "" && (
                <>
                  <span className="h-2.5 w-px bg-neutral-800"></span>
                  <span className="text-white font-bold">{userInfo.name}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
