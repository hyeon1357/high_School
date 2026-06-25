import React, { useState, useEffect } from "react";
import { X, Save, Trash2, GraduationCap, Sparkles } from "lucide-react";
import { UserInfo } from "../types";

interface EditUserModalProps {
  isOpen: boolean;
  userInfo: UserInfo;
  onClose: () => void;
  onSave: (newInfo: UserInfo) => void;
  onResetAll: () => void;
}

export default function EditUserModal({
  isOpen,
  userInfo,
  onClose,
  onSave,
  onResetAll,
}: EditUserModalProps) {
  const [grade, setGrade] = useState<string>(userInfo.grade);
  const [classGroup, setClassGroup] = useState<string>(userInfo.classGroup);
  const [number, setNumber] = useState<string>(userInfo.number);
  const [error, setError] = useState<string>("");

  // Sync state with props when open
  useEffect(() => {
    if (isOpen) {
      setGrade(userInfo.grade);
      setClassGroup(userInfo.classGroup);
      setNumber(userInfo.number);
      setError("");
    }
  }, [isOpen, userInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!grade.trim() || parseInt(grade) <= 0 || isNaN(parseInt(grade))) {
      setError("올바른 학년을 입력해주세요.");
      return;
    }
    if (!classGroup.trim() || parseInt(classGroup) <= 0 || isNaN(parseInt(classGroup))) {
      setError("올바른 반 정보를 입력해주세요.");
      return;
    }
    if (!number.trim() || parseInt(number) <= 0 || isNaN(parseInt(number))) {
      setError("올바른 번호를 입력해주세요.");
      return;
    }

    onSave({
      grade: grade.trim(),
      classGroup: classGroup.trim(),
      number: number.trim(),
      name: "",
    });
  };

  const handleResetClick = () => {
    if (confirm("정말로 학생 정보를 완전히 초기화하고 로그아웃하시겠습니까?\n(기존에 등록해둔 하루하루 상세 스크린타임 기록은 안전하게 보존됩니다.)")) {
      onResetAll();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="edit-user-modal-wrapper">
      {/* Dark backdrop overlay */}
      <div 
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        id="edit-user-backdrop"
      />

      {/* Modal Dialog Body */}
      <div 
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 md:p-8 text-neutral-200 z-10 animate-in fade-in zoom-in-95 duration-200"
        id="edit-user-dialog"
      >
        {/* Header Close Trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="닫기"
          id="close-edit-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Group */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-1.5">
              학생 정보 수정
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              대시보드와 학급 랭킹에 표시될 정보를 수정합니다.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Grade, Class, Number fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-400 font-bold mb-1 block">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>{num}학년</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 font-bold mb-1 block">반</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}반</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 font-bold mb-1 block">번호</label>
              <input
                type="number"
                placeholder="01"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setError("");
                }}
                min="1"
                max="99"
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

        {/* Name input is removed as requested to register and edit profiles without names */}

          {/* Error Banner */}
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-lg text-center font-sans">
              ⚠️ {error}
            </div>
          )}

          {/* Separator */}
          <div className="h-px bg-neutral-800/60 my-2" />

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer order-last sm:order-first"
              id="save-edit-info-btn"
            >
              <Save className="w-3.5 h-3.5" />
              <span>수정 완료 (저장)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-semibold text-xs py-3 px-4 rounded-xl border border-neutral-750 active:scale-[0.98] transition-all cursor-pointer"
              id="cancel-edit-info-btn"
            >
              취소
            </button>
          </div>

          {/* Dangerous Zone footer button: Reset completely */}
          <div className="pt-2 border-t border-neutral-800/80 flex justify-end">
            <button
              type="button"
              onClick={handleResetClick}
              className="text-[11px] text-neutral-500 hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              id="full-reset-danger-btn"
            >
              <Trash2 className="w-3 h-3" />
              <span>학생정보 전체 초기화 (로그아웃)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
