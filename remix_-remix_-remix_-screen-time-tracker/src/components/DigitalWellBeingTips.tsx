import React from "react";
import { Sparkles, BrainCircuit, Moon, CheckCircle2, ShieldCheck } from "lucide-react";
import { ScreenTimeEntry } from "../types";

interface DigitalWellBeingTipsProps {
  entries: ScreenTimeEntry[];
}

export default function DigitalWellBeingTips({ entries }: DigitalWellBeingTipsProps) {
  if (entries.length === 0) return null;

  // Compute stats
  const totalEntries = entries.length;
  const totalMinutes = entries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
  const avgMinutes = totalMinutes / totalEntries;

  // Dynamic values
  const isHighUsage = avgMinutes > 5 * 60; // Over 5 hours is heavy usage
  const isModerateUsage = avgMinutes >= 3 * 60 && avgMinutes <= 5 * 60;

  // Build tailor-made tips
  const getDynamicTips = () => {
    const tips = [];
    
    if (isHighUsage) {
      tips.push({
        title: "소셜 미디어 및 유튜브 중독 방지 타이머",
        desc: "sns에 중독 방지 타이머를 설정하여 오랜 시간동안 sns 하는 것을 방지하세요.",
        type: "control"
      });
      tips.push({
        title: "20-20 시력 보호 요령",
        desc: "사용 20분마다 20초간 먼 초록색 자연물이나 벽면을 지시하여 망막 피로를 완화하세요.",
        type: "health"
      });
    } else if (isModerateUsage) {
      tips.push({
        title: "알림 채널의 모노톤화",
        desc: "불필요한 인앱 푸시 알림은 무음으로 이전하고 스스로 명확한 목적이 있을 때에만 화면을 켜는 약속을 하세요.",
        type: "control"
      });
      tips.push({
        title: "취침 전 도파민 디톡스",
        desc: "취침 30분 전 스마트폰 불빛은 쾌면 호르몬인 멜라토닌 분비를 방해합니다. 자기 전에는 기기를 멀리 하세요.",
        type: "sleep"
      });
    }
    // Default common wellness tips
    tips.push({
      title: "도파민 보상 회로 초기화",
      desc: "휴대폰을 최대한 멀리 두는 습관을 기르세요. 접근성이 낮아질수록 기기 사용 하지 않는 시간은 증가합니다.",
      type: "study"
    });

    return tips;
  };

  const adviceTips = getDynamicTips();

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 p-5 md:p-6 rounded-2xl shadow-xl backdrop-blur-sm" id="wellbeing-advice">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          AI WELLBEING TIPS
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight"> 사용 조절 가이드</h2>
      </div>

      <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-xl flex items-start gap-3 mb-5">
        <BrainCircuit className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-indigo-300">현재 수치 맞춤 조언</h3>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed font-sans">
            사용자의 평균 하루 사용 시간은 <span className="font-semibold text-white">{Math.floor(avgMinutes / 60)}시간 {Math.round(avgMinutes % 60)}분</span> 입니다. 목표인 4시간 미만 수준을 수호하기 위해 다음 일상 수칙을 실천해보세요!
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {adviceTips.map((tip, idx) => (
          <div key={idx} className="bg-neutral-950/40 border border-neutral-850 p-3.5 rounded-xl flex items-start gap-3">
            <div className="flex-shrink-0 w-7.5 h-7.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              {tip.type === "health" && <Moon className="w-3.5 h-3.5 text-rose-400" />}
              {tip.type === "control" && <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
              {tip.type === "praise" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              {["social", "game", "media", "study", "sleep"].includes(tip.type) && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-neutral-200">{tip.title}</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
