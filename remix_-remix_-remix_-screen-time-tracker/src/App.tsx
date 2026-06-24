import { useState, useEffect } from "react";
import { ShieldCheck, Users, ArrowLeft, Trash2 } from "lucide-react";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import ScreenTimeForm from "./components/ScreenTimeForm";
import ClassmateLeaderboard from "./components/ClassmateLeaderboard";
import DigitalWellBeingTips from "./components/DigitalWellBeingTips";
import { ScreenTimeEntry, UserInfo, StudentProfile } from "./types";
import EditUserModal from "./components/EditUserModal";

const PROFILES_KEY = "screen_time_student_profiles_v4";
const ACTIVE_PROFILE_ID_KEY = "screen_time_active_profile_id_v4";

const generateTimestamp = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime(); // 12:00 local representation
};

const NEW_PROFILE_TEMPLATE_ENTRIES = [
  { id: "t-1", date: "2026-06-21", timestamp: generateTimestamp("2026-06-21"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-2", date: "2026-06-22", timestamp: generateTimestamp("2026-06-22"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-3", date: "2026-06-23", timestamp: generateTimestamp("2026-06-23"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-4", date: "2026-06-24", timestamp: generateTimestamp("2026-06-24"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-5", date: "2026-06-25", timestamp: generateTimestamp("2026-06-25"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-6", date: "2026-06-26", timestamp: generateTimestamp("2026-06-26"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-7", date: "2026-06-27", timestamp: generateTimestamp("2026-06-27"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" }
];

export default function App() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Helper to fetch latest profiles from the backend server
  const loadProfilesFromServer = async (activeIdToResolve?: string | null) => {
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) throw new Error("Failed to load screen time profiles from server.");
      const data = await res.json() as StudentProfile[];
      setProfiles(data);
      
      const checkId = activeIdToResolve !== undefined ? activeIdToResolve : currentProfileId;
      if (checkId && !data.some(p => p.id === checkId)) {
        // If logged-in profile got deleted or not found, log out
        setCurrentProfileId(null);
        localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
      }
      setLoadingError(null);
    } catch (e) {
      console.error("Error loading profiles:", e);
      setLoadingError("서버와의 연결이 원활하지 않습니다. 실시간 랭킹 공유를 위해 잠시만 대기해주세요.");
    }
  };

  // Load backend profiles on mount and resolve logged in client user ID (Only ON MOUNT)
  useEffect(() => {
    setIsClient(true);
    
    // Resolve logged in client user ID from localStorage
    const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    if (savedActiveId) {
      setCurrentProfileId(savedActiveId);
    }

    // Initial load
    loadProfilesFromServer(savedActiveId);
  }, []);

  // Periodically sync profiles with background server
  useEffect(() => {
    // Yeolpumta-style real-time periodic background sync (every 5 seconds)
    const intervalObj = setInterval(() => {
      loadProfilesFromServer();
    }, 5000);

    return () => clearInterval(intervalObj);
  }, [currentProfileId]);

  const handleLogin = async (grade: string, classGroup: string, number: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, classGroup, number, password: passwordInput })
      });
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || "로그인 정보를 확인해주세요." };
      }
      const loggedProfile = await res.json() as StudentProfile;
      
      setCurrentProfileId(loggedProfile.id);
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, loggedProfile.id);
      await loadProfilesFromServer(loggedProfile.id);
      return { success: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, error: error.message || "로그인 서버와의 통신 중 오류가 발생했습니다." };
    }
  };

  const handleSignUp = async (signUpData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/profile/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || "회원가입에 실패했습니다." };
      }
      const newProfile = await res.json() as StudentProfile;
      
      setCurrentProfileId(newProfile.id);
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, newProfile.id);
      await loadProfilesFromServer(newProfile.id);
      return { success: true };
    } catch (error: any) {
      console.error("Sign up failed:", error);
      return { success: false, error: error.message || "회원가입 서버와의 통신 중 오류가 발생했습니다." };
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveUserInfo = async (newInfo: UserInfo) => {
    if (!currentProfileId) return;

    try {
      const res = await fetch(`/api/profile/${currentProfileId}/update-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInfo: newInfo })
      });
      if (!res.ok) throw new Error("Update user info failed");
      
      setIsEditModalOpen(false);
      await loadProfilesFromServer();
    } catch (error) {
      console.error(error);
      alert("프로필 정보를 수정하는 도중 서버 오류가 발생하였습니다.");
    }
  };

  const handleResetAllUserInfo = () => {
    setCurrentProfileId(null);
    localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    setIsEditModalOpen(false);
  };

  const handleSwitchProfile = (id: string) => {
    setCurrentProfileId(id);
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  };

  const handleDeleteProfile = async (id: string) => {
    // Optimistically remove from state so that it disappears instantly
    setProfiles(prev => prev.filter(p => p.id !== id));

    try {
      const res = await fetch(`/api/profile/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete profile failed");
      
      if (currentProfileId === id) {
        setCurrentProfileId(null);
        localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
      }
      await loadProfilesFromServer();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("프로필 삭제 작업을 완료하지 못했습니다.");
      // Rollback on failure
      await loadProfilesFromServer();
    }
  };

  // Update entries of currently active profile in backend database
  const handleUpdateActiveEntries = async (
    newEntries: { date: string; hours: number; minutes: number; notes: string; imageUrl?: string; imageName?: string }[]
  ) => {
    if (!currentProfileId) return;

    try {
      const res = await fetch(`/api/profile/${currentProfileId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: newEntries })
      });
      
      if (!res.ok) throw new Error("Updating entries failed");
      await loadProfilesFromServer();
    } catch (error) {
      console.error(error);
      alert("주간 스크린타임 기록 데이터를 저장하는 데 실패했습니다.");
    }
  };

  // Derive active model attributes
  const currentProfile = profiles.find(p => p.id === currentProfileId) || null;
  const userInfo = currentProfile ? currentProfile.userInfo : null;
  const entries = currentProfile ? currentProfile.entries : [];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#17171B] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-neutral-400 font-mono">대시보드를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#17171B] text-[#F3F4F6] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-white" id="screen-time-app">
      {/* Dynamic Header */}
      <Header 
        userInfo={userInfo} 
        onLogout={handleOpenEditModal} 
        onLogoClick={() => {
          setCurrentProfileId(null);
          setIsAdminMode(false);
          localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
        }}
      />

      {/* Student Profile Editing Modal */}
      {userInfo && currentProfile && (
        <EditUserModal
          isOpen={isEditModalOpen}
          userInfo={userInfo}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveUserInfo}
          onResetAll={handleResetAllUserInfo}
        />
      )}

      {/* Main Container Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {!currentProfile ? (
          isAdminMode ? (
            // Admin management screen
            <div className="max-w-xl mx-auto bg-neutral-900/40 border border-indigo-500/20 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md space-y-6 animate-fade-in" id="admin-panel">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      🔒 학급 디톡스 관리자 대시보드
                    </h2>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">
                      Class Administrator Console
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>

              <div className="bg-neutral-950/60 border border-neutral-850 p-4 rounded-xl space-y-2 text-xs text-neutral-400 leading-relaxed font-sans">
                <p>
                  📢 <span className="text-indigo-400 font-bold">안내:</span> 이미 제출 및 생성된 학급 학생들의 스크린타임 기록 목록입니다. 특정 학생의 이름을 골라 해당 학생의 전용 기록실에 대리 접속하거나 기록 변경을 수행할 수 있습니다.
                </p>
                <div className="flex gap-4 pt-1 font-mono text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    총 가입 인원: <span className="text-white font-bold">{profiles.length}명</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase flex items-center gap-1.5 mb-1">
                  📁 등록된 대원들의 디톡스 기록실 일람 (랭킹 순 정렬)
                </h3>

                {profiles.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-950/20 border border-neutral-850 border-dashed rounded-xl">
                    <p className="text-xs text-neutral-500">아직 등록된 학급 학생 프로필이 존재하지 않습니다.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {[...profiles]
                      .map(p => {
                        const filledEntries = p.entries || [];
                        const totalMinutes = filledEntries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
                        const avgMinutes = filledEntries.length > 0 ? totalMinutes / filledEntries.length : 0;
                        return { ...p, avgMinutes };
                      })
                      .sort((a, b) => a.avgMinutes - b.avgMinutes)
                      .map((p, index) => {
                        const isConfirming = confirmDeleteId === p.id;
                        const formatHoursMinutes = (totalMin: number) => {
                          const hrs = Math.floor(totalMin / 60);
                          const mins = Math.round(totalMin % 60);
                          if (hrs === 0) return `${mins}분`;
                          return `${hrs}시간 ${mins}분`;
                        };

                        return (
                          <div
                            key={p.id}
                            className={`w-full flex items-center justify-between p-3 px-4 rounded-xl transition-all ${
                              isConfirming 
                                ? "bg-rose-950/20 border border-rose-500/20" 
                                : "bg-neutral-950/50 hover:bg-neutral-950/80 border border-neutral-850 text-neutral-300"
                            }`}
                          >
                            {isConfirming ? (
                              <div className="flex-1 flex items-center justify-between gap-3 animate-fade-in text-left">
                                <div className="min-w-0">
                                  <span className="text-[11px] text-rose-400 font-bold block">
                                    🤔 실시간 기록을 정말 영구 삭제할까요?
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block truncate font-sans mt-0.5">
                                    대상: {p.userInfo.name?.startsWith("학생 (") 
                                      ? `${p.userInfo.grade}학년 ${p.userInfo.classGroup}반 ${p.userInfo.number}번 학생`
                                      : `${p.userInfo.grade}학년 ${p.userInfo.classGroup}반 ${p.userInfo.number}번 (${p.userInfo.name})`
                                    }
                                  </span>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      handleDeleteProfile(p.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10.5px] rounded-lg cursor-pointer transition-colors"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-[10.5px] rounded-lg cursor-pointer transition-colors"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-neutral-200 block truncate text-xs text-left">
                                      {p.userInfo.name?.startsWith("학생 (") 
                                        ? `${p.userInfo.grade}학년 ${p.userInfo.classGroup}반 ${p.userInfo.number}번 학생`
                                        : `${p.userInfo.grade}학년 ${p.userInfo.classGroup}반 ${p.userInfo.number}번 (${p.userInfo.name || "학생"})`
                                      }
                                    </span>
                                    <span className="text-[10px] text-neutral-500 font-sans block mt-0.5 text-left">
                                      평균 사용: <span className="text-emerald-400 font-mono font-bold">{formatHoursMinutes(p.avgMinutes)}</span>
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      handleSwitchProfile(p.id);
                                      setIsAdminMode(false); // Switch to student space
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all cursor-pointer"
                                  >
                                    입장 ➜
                                  </button>
                                  
                                  <button
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                                    title="학생 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Introduction Instructions & ID Class Entry Screen (Supports registering students)
            <div className="space-y-6">
              <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} onAdminSuccess={() => setIsAdminMode(true)} />
            </div>
          )
        ) : (
          // Full Dashboard
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-fade-in">
            {/* Left Column: Log inputs & wellbeing hints */}
            <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
              <ScreenTimeForm entries={entries} currentProfileId={currentProfileId} onSubmit={handleUpdateActiveEntries} />
              <DigitalWellBeingTips entries={entries} />
            </div>

            {/* Right Column: Leaderboard and Stats overview of active profile */}
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <ClassmateLeaderboard 
                profiles={profiles}
                currentProfileId={currentProfileId}
                onSwitchProfile={handleSwitchProfile}
                onRegisterProfile={() => {}}
                onDeleteProfile={handleDeleteProfile}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer Banner */}
      <footer className="w-full border-t border-neutral-800 bg-neutral-950/20 py-4.5 text-center text-xs text-neutral-500 font-sans mt-auto">
        <p>© 2026 ScreenTime Tracker. 한국 학급 디지털 디톡스 캠페인 • 모든 데이터는 오직 본인 기기에만 로컬 보관됩니다.</p>
      </footer>
    </div>
  );
}
