import React, { useState } from "react";
import { Smartphone, ArrowRight, ShieldCheck, Sparkles, Lock, UserPlus, LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: (grade: string, classGroup: string, number: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (signUpData: any) => Promise<{ success: boolean; error?: string }>;
  onAdminSuccess?: () => void;
}

export default function LoginScreen({ onLogin, onSignUp, onAdminSuccess }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Shared fields
  const [grade, setGrade] = useState<string>("1");
  const [classGroup, setClassGroup] = useState<string>("1");
  const [number, setNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Admin access fields
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim() === "resfej40#452") {
      if (onAdminSuccess) {
        onAdminSuccess();
      }
    } else {
      setAdminError("비밀번호가 올바르지 않습니다. 다시 입력해주세요.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validations
    if (!grade.trim() || parseInt(grade) <= 0 || isNaN(parseInt(grade))) {
      setError("올바른 학년을 선택해 주세요.");
      return;
    }
    if (!classGroup.trim() || parseInt(classGroup) <= 0 || isNaN(parseInt(classGroup))) {
      setError("올바른 반 정보를 선택해 주세요.");
      return;
    }
    if (!number.trim() || parseInt(number) <= 0 || isNaN(parseInt(number))) {
      setError("올바른 번호를 입력해 주세요.");
      return;
    }
    if (!password.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);

    if (activeTab === "login") {
      const res = await onLogin(grade.trim(), classGroup.trim(), number.trim(), password.trim());
      if (!res.success) {
        setError(res.error || "비밀번호가 틀렸습니다. 다시 인해주시거나 계정을 확인해주세요.");
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setError("이름을 입력해 주세요.");
        setLoading(false);
        return;
      }
      if (password.trim().length < 4) {
        setError("비밀번호는 최소 4글자 이상이어야 합니다.");
        setLoading(false);
        return;
      }

      const res = await onSignUp({
        grade: grade.trim(),
        classGroup: classGroup.trim(),
        number: number.trim(),
        password: password.trim(),
        name: name.trim()
      });
      if (!res.success) {
        setError(res.error || "이미 등록되어 있는 학년, 반, 번호입니다.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md text-neutral-200 mt-6 sm:mt-12" id="login-panel">
      {/* Visual Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/10 mb-4 animate-bounce">
          <Smartphone className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
          ScreenTime <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Tracker</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          학년, 반, 번호와 본인만의 비밀번호로 안전하게 스크린타임을 분석하세요!
        </p>
      </div>

      {/* MANDATORY MEASUREMENT PERIOD BANNER */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-2 border-amber-500/40 p-4 rounded-xl mb-6 shadow-md" id="period-alert-banner">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <h3 className="text-[14px] font-extrabold text-amber-300">
            [필독] 측정 설정 안내
          </h3>
        </div>
        <div className="space-y-3 text-xs text-neutral-200">
          <p className="leading-relaxed text-[13px]">
            <span className="text-white font-bold underline decoration-amber-400 decoration-2">6월 21일 ∼ 6월 27일</span> 기간에 <br />
            측정된 <span className="text-amber-300 font-bold">일주일 평균 사용 시간</span>을 입력해야 합니다.
          </p>
          <p className="leading-relaxed pt-0.5 text-[13px] text-neutral-200">
            제출한 스크린샷이 <span className="text-white font-bold">허위 또는 잘못된 정보</span>로 판단될 경우, <br />
            <span className="text-rose-400 font-bold underline decoration-rose-400 decoration-2">해당 기록은 무효 처리</span>됩니다.
          </p>
          <p className="leading-relaxed pt-0.5 text-[13px] text-neutral-200">
             <span className="text-amber-300 font-bold">본인만의 고유한 비밀번호를 설정하여 로그인해 주세요.</span> 
          </p>
        </div>
      </div>

      {/* DETAILED USER GUIDE / MANUAL */}
      <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl space-y-3.5 mb-6">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            스마트폰 이용 시간 확인법
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed text-neutral-300">
          <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/80">
            <span className="font-semibold text-emerald-300 block mb-1">🍎 iPhone (iOS) 사용자</span>
            <p className="text-[11px] text-neutral-400 font-sans">
              설정 &gt; <span className="text-neutral-200 font-medium">스크린 타임</span> 메뉴 진입 &gt; '모든 활동 보기' &gt; 주간 평균(일일 평균) 사용 시간 확인 및 스크린샷 캡처
            </p>
          </div>
          
          <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/80">
            <span className="font-semibold text-indigo-300 block mb-1">🤖 Android (Galaxy 등)</span>
            <p className="text-[11px] text-neutral-400 font-sans">
              설정 &gt; <span className="text-neutral-200 font-medium">디지털 웰빙 및 자녀 보호 기능</span> 진입 &gt; 주간 리포트에서 일일 평균 사용 시간 확인 및 스크린샷 캡처
            </p>
          </div>
        </div>
      </div>

      {/* Selection Tabs */}
      <div className="flex border-b border-neutral-800 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab("login"); setError(""); }}
          className={`flex-1 pb-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "login"
              ? "text-emerald-400 border-emerald-500 font-extrabold"
              : "text-neutral-400 border-transparent hover:text-neutral-200"
          }`}
          id="login-tab-btn"
        >
          <LogIn className="w-3.5 h-3.5" />
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("signup"); setError(""); }}
          className={`flex-1 pb-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "signup"
              ? "text-emerald-400 border-emerald-500 font-extrabold"
              : "text-neutral-400 border-transparent hover:text-neutral-200"
          }`}
          id="signup-tab-btn"
        >
          <UserPlus className="w-3.5 h-3.5" />
          회원가입
        </button>
      </div>

      {/* SIGNUP & LOGIN FORM */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Dynamic header label based on session */}
        <div className="bg-neutral-950/30 p-4 border border-neutral-800 rounded-xl space-y-4">
          <span className="text-[11.5px] font-bold text-neutral-300 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
            <GraduationCapIcon className="w-4 h-4 text-emerald-400" />
            <span>본인의 학급 정보 및 번호 선택</span>
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-400 font-semibold mb-1 block">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans cursor-pointer h-9"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>{num}학년</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 font-semibold mb-1 block">반</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans cursor-pointer h-9"
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}반</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 font-semibold mb-1 block">번호</label>
              <input
                type="number"
                placeholder="번호"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                min="1"
                max="99"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-emerald-500 font-sans h-9"
              />
            </div>
          </div>
        </div>

        {/* Name input block (only for signup) */}
        {activeTab === "signup" && (
          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-semibold mb-1 block">
              이름 (실명)
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요 (예: 홍길동)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 font-sans h-9"
            />
          </div>
        )}

        {/* Password input block */}
        <div className="space-y-1">
          <label className="text-xs text-neutral-400 font-semibold mb-1 block">
            {activeTab === "login" ? "비밀번호" : "설정할 비밀번호 (최소 4자)"}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder={activeTab === "login" ? "비밀번호를 입력하세요" : "새 비밀번호 설정"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Errors */}
        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-lg text-center font-sans animate-bounce">
            ⚠️ {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 disabled:opacity-50 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
        >
          <span>
            {loading 
              ? "계정 처리 중..." 
              : activeTab === "login" 
                ? "로그인 완료 및 대시보드 진입" 
                : "회원가입 완료 및 로그인"
            }
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Admin Quick Entry Form */}
      <div className="mt-8 pt-4 border-t border-neutral-800/85">
        {!showAdminLogin ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAdminLogin(true)}
              className="text-[11px] text-neutral-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>관리자(Admin) 모드 로그인</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="space-y-2.5 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                <span>관리자 로그인 (Class Admin)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword("");
                  setAdminError("");
                }}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
              >
                닫기
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAdminError("");
                }}
                className="flex-1 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 border border-indigo-700/30 text-white font-bold text-xs px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                입장
              </button>
            </div>
            {adminError && (
              <p className="text-[10px] text-rose-400 font-sans">
                ⚠️ {adminError}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// Inline GraduationCapIcon definition since lucide-react exports GraduationCap
function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
    </svg>
  );
}
