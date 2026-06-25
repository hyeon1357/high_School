import React, { useState } from "react";
import { Award, Trophy, Medal, Trash2, UserPlus, X, LogIn, HeartHandshake, HelpCircle, Edit } from "lucide-react";
import { UserInfo, StudentProfile } from "../types";

interface ClassmateLeaderboardProps {
  profiles: StudentProfile[];
  currentProfileId: string | null;
  onSwitchProfile: (id: string) => void;
  onRegisterProfile: (info: UserInfo) => void;
  onDeleteProfile: (id: string) => void;
}

export default function ClassmateLeaderboard({
  profiles,
  currentProfileId,
  onSwitchProfile,
  onRegisterProfile,
  onDeleteProfile,
}: ClassmateLeaderboardProps) {

  // Process and sort participants by their actual calculated daily average minutes (lowest first for health score)
  const rankedParticipants = profiles.map(p => {
    const filledEntries = p.entries || [];
    const totalMinutes = filledEntries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
    const avgMinutes = filledEntries.length > 0 ? totalMinutes / filledEntries.length : 0;
    
    return {
      id: p.id,
      name: p.userInfo.name || "학생",
      grade: p.userInfo.grade,
      classGroup: p.userInfo.classGroup,
      number: p.userInfo.number,
      avgMinutes,
      totalMinutes,
      entriesCount: filledEntries.length,
      isUser: p.id === currentProfileId
    };
  }).sort((a, b) => a.avgMinutes - b.avgMinutes);

  // Identify current rank characteristics
  const userRankIndex = rankedParticipants.findIndex(p => p.isUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 0;
  const userAvgMinutes = userRankIndex !== -1 ? rankedParticipants[userRankIndex].avgMinutes : 0;

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`정말로 [${name}] 학생의 모든 스크린타임 기록과 통계를 대시보드에서 영구 삭제하시겠습니까?`)) {
      onDeleteProfile(id);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-6 h-6 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 flex items-center justify-center font-bold text-xs animate-bounce" title="1등 금메달">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-400/15 border border-slate-400/30 text-slate-300 flex items-center justify-center font-bold text-xs" title="2등 은메달">
          <Medal className="w-3.5 h-3.5 text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-600/15 border border-amber-600/30 text-amber-500 flex items-center justify-center font-bold text-xs" title="3등 동메달">
          <Medal className="w-3.5 h-3.5 text-amber-650" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center font-mono text-[10px]">
        {rank}
      </div>
    );
  };

  const formatHoursMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    if (hours === 0) return `${minutes}분`;
    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className="bg-neutral-900/30 border border-neutral-800 p-4 md:p-5 rounded-2xl shadow-xl backdrop-blur-sm space-y-3" id="classmate-leaderboard">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-neutral-950/20 p-2.5 rounded-xl border border-neutral-800/40">
        <div className="flex items-center gap-1.5 animate-fade-in">
          <div className="p-1 px-1.5 rounded bg-emerald-555/15 text-emerald-405 text-[9px] font-black uppercase tracking-wider">
            REALTIME RANKING
          </div>
          <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
            전학년 실시간 스크린타임 랭킹
          </h2>
        </div>
      </div>

      <div className="bg-neutral-950/50 p-2.5 rounded-xl border border-neutral-850/80 text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-sans">
        🚀 <span className="text-emerald-400 font-bold">주간 평균 스크린타임이 적은 순(디톡스 우수 순)</span>으로 실시간 순위가 자동 산정되어 공유됩니다.
      </div>

      {/* Active profile stats banner */}
      {currentProfileId && userRank > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-white leading-tight">나의 전학년 실시간 랭킹 순위</h4>
              <p className="text-[10px] text-neutral-405 font-sans mt-0.5">
                전체 {rankedParticipants.length}명 대원 중 <span className="text-emerald-400 font-bold font-mono text-xs">{userRank}위</span>
              </p>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800 px-2 py-1 rounded-lg text-right">
            <span className="text-[9px] text-neutral-555 font-sans block leading-none mb-0.5">내 주간 평균치</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {formatHoursMinutes(userAvgMinutes)}
            </span>
          </div>
        </div>
      )}

      {/* Participant List */}
      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {rankedParticipants.map((p, index) => {
          const rankNum = index + 1;
          const isUser = p.isUser;
          
          return (
            <div 
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isUser 
                  ? "bg-gradient-to-r from-emerald-950/20 to-neutral-900/60 border-2 border-emerald-500/40 shadow-md scale-[1.01]" 
                  : "bg-neutral-950/40 border border-neutral-850 hover:border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {getRankBadge(rankNum)}
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${isUser ? "text-emerald-400" : "text-neutral-200"}`}>
                      {`${p.grade}학년 ${p.classGroup}반 ${p.number}번 학생`}
                    </span>
                    {isUser && (
                      <span className="bg-emerald-500 text-neutral-950 text-[9px] font-black px-1.5 py-0.2 rounded font-sans leading-tight">
                        작성중
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-500 font-sans mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${p.avgMinutes > 300 ? "bg-rose-500" : p.avgMinutes > 180 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                    {p.avgMinutes > 300 ? "🚨 과의존 경보수준" : p.avgMinutes > 180 ? "⚠️ 관찰 필요수준" : "🌿 친환경 일반웰빙"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-right">
                <span className={`text-xs font-mono font-bold ${isUser ? "text-emerald-400" : "text-neutral-300"}`}>
                  {formatHoursMinutes(p.avgMinutes)}
                </span>
              </div>

            </div>
          );
        })}

        {rankedParticipants.length === 0 && (
          <div className="border border-dashed border-neutral-850 rounded-xl p-6 text-center space-y-2 mt-2">
            <HeartHandshake className="w-7 h-7 text-neutral-700 mx-auto" />
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              현재는 랭킹보드에 등록된 학생이 없습니다.<br />
              상단의 <span className="text-emerald-400 font-bold">학생 등록 / 대시보드 진입</span>에서 본인 정보를 등록하면 실시간 순위에 등장합니다!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
