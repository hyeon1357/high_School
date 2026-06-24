import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, AlertCircle, ClipboardList, Clock, X, ZoomIn, Info
} from "lucide-react";
import { ScreenTimeEntry } from "../types";

interface ScreenTimeFormProps {
  entries: ScreenTimeEntry[];
  currentProfileId: string | null;
  onSubmit: (entries: { date: string; hours: number; minutes: number; notes: string; imageUrl?: string; imageName?: string }[]) => void;
}

export default function ScreenTimeForm({ entries, currentProfileId, onSubmit }: ScreenTimeFormProps) {
  const [avgHours, setAvgHours] = useState<number>(3);
  const [avgMinutes, setAvgMinutes] = useState<number>(30);
  
  const [notes, setNotes] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [compressionStatus, setCompressionStatus] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  const prevProfileIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form inputs when active student or entries update (if not dirty by active editing)
  useEffect(() => {
    const profileChanged = prevProfileIdRef.current !== currentProfileId;
    prevProfileIdRef.current = currentProfileId;

    if (profileChanged) {
      setIsDirty(false);
    }

    if (profileChanged || !isDirty) {
      if (entries && entries.length > 0) {
        // Calculate average from server entries (since all entries have same hours/minutes when submitted using this form)
        const totalMinutes = entries.reduce((acc, curr) => acc + (curr.hours * 60 + curr.minutes), 0);
        const avgOverallMinutes = entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0;
        const avgH = Math.floor(avgOverallMinutes / 60);
        const avgM = Math.round(avgOverallMinutes % 60);
        setAvgHours(avgH || 3);
        setAvgMinutes(avgM || 30);

        // Find if any entry has a registered screenshot
        const entryWithImage = entries.find(e => e.imageUrl);
        if (entryWithImage) {
          setImageUrl(entryWithImage.imageUrl || "");
          setImageName(entryWithImage.imageName || "");
        } else if (profileChanged) {
          setImageUrl("");
          setImageName("");
        }

        // Find if any entry has notes
        const entryWithNotes = entries.find(e => e.notes);
        if (entryWithNotes) {
          setNotes(entryWithNotes.notes || "");
        } else if (profileChanged) {
          setNotes("");
        }
      } else {
        setAvgHours(3);
        setAvgMinutes(30);
        if (profileChanged) {
          setImageUrl("");
          setImageName("");
          setNotes("");
        }
      }
    }
  }, [entries, currentProfileId, isDirty]);

  // Handle Hours input change
  const handleHoursChange = (value: string) => {
    setIsDirty(true);
    const parsed = parseInt(value, 10);
    const validated = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setAvgHours(validated);
    
    // Check ranges on the fly
    if (validated >= 24) {
      setValidationError("시간은 0부터 23 사이의 값이어야 합니다.");
    } else if (avgMinutes >= 60) {
      setValidationError("분은 0부터 59 사이의 값이어야 합니다.");
    } else {
      setValidationError("");
    }
  };

  // Handle Minutes input change
  const handleMinutesChange = (value: string) => {
    setIsDirty(true);
    const parsed = parseInt(value, 10);
    const validated = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setAvgMinutes(validated);
    
    // Check ranges on the fly
    if (validated >= 60) {
      setValidationError("분은 0부터 59 사이의 값이어야 합니다.");
    } else if (avgHours >= 24) {
      setValidationError("시간은 0부터 23 사이의 값이어야 합니다.");
    } else {
      setValidationError("");
    }
  };

  // Compress uploaded images in client canvas to save local storage quota
  const processAndCompressFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setValidationError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setCompressionStatus("이미지 최적화 중...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Str = canvas.toDataURL("image/jpeg", 0.7);
          setImageUrl(base64Str);
          setImageName(file.name);
          setIsDirty(true);
          setCompressionStatus("최적화 완료!");
          setTimeout(() => setCompressionStatus(""), 2000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    setValidationError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageName("");
    setIsDirty(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetToDefault = () => {
    setAvgHours(3);
    setAvgMinutes(30);
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (avgHours >= 24) {
      setValidationError("시간은 0부터 23 사이의 값이어야 합니다.");
      return;
    }

    if (avgMinutes >= 60) {
      setValidationError("분은 0부터 59 사이의 값이어야 합니다.");
      return;
    }

    if (!imageUrl) {
      setValidationError("주간 스크린샷 증명 사진을 반드시 첨부해야 등록이 가능합니다.");
      return;
    }

    // Submit dates for template entries mapped with the average time entered
    const datesToUse = (entries && entries.length > 0)
      ? entries.map(e => e.date)
      : ["2026-06-21", "2026-06-22", "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27"];

    onSubmit(
      datesToUse.map(dateStr => ({
        date: dateStr,
        hours: avgHours,
        minutes: avgMinutes,
        notes: notes.trim(),
        imageUrl: imageUrl || undefined,
        imageName: imageName || undefined
      }))
    );

    setIsDirty(false); // Reset dirty flag upon successful local-to-remote submit
    setValidationError("");
  };

  return (
    <div className="bg-neutral-900/30 border border-neutral-800 p-5 md:p-6 rounded-2xl shadow-xl backdrop-blur-sm space-y-5" id="weekly-time-logger-form">
      {/* Header Description */}
      <div className="flex flex-col gap-1 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider uppercase font-mono">
            digital wellbeing input
          </div>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight mt-1.5">스크린타임 일주일 평균 기입</h2>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          스마트폰의 주간 리포트에 표시된 <b>일주일 하루 평균 스크린타임 사용 시간</b>을 기입하세요. 이 값이 한 주 전체의 날짜별 세부 사용량으로 일괄 설정됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* INPUT CARD */}
        <div className="bg-neutral-950/60 hover:bg-neutral-950/80 border border-neutral-850 p-4 rounded-xl transition-all space-y-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-sans">
            <span>
              일주일간의 하루 평균 스크린타임 입력:
            </span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[10px] text-neutral-500 hover:text-rose-400 underline cursor-pointer"
            >
              기본값 자동 설정
            </button>
          </div>
          
          {/* WEEKLY AVERAGE INPUTS */}
          <div className="flex items-center justify-center gap-4 py-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2 flex-1 max-w-[140px] relative hover:border-neutral-700 transition-colors">
              <select
                value={avgHours}
                onChange={(e) => handleHoursChange(e.target.value)}
                className="w-full bg-transparent text-center text-xl font-display font-black text-white focus:outline-none cursor-pointer pr-1"
                style={{ textAlignLast: "center" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} className="bg-neutral-900 text-white text-base">
                    {i}
                  </option>
                ))}
              </select>
              <span className="text-xs text-neutral-400 font-bold select-none ml-2 shrink-0 pointer-events-none">시간</span>
            </div>

            <span className="text-neutral-650 font-display font-bold text-lg select-none">:</span>

            <div className="flex items-center justify-between bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2 flex-1 max-w-[140px] relative hover:border-neutral-700 transition-colors">
              <select
                value={avgMinutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="w-full bg-transparent text-center text-xl font-display font-black text-white focus:outline-none cursor-pointer pr-1"
                style={{ textAlignLast: "center" }}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="bg-neutral-900 text-white text-base">
                    {i}
                  </option>
                ))}
              </select>
              <span className="text-xs text-neutral-400 font-bold select-none ml-2 shrink-0 pointer-events-none">분</span>
            </div>
          </div>
        </div>

        {/* VERIFICATION PROOF UPLOADER */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 tracking-wider block">
            주간 스크린샷 증명 업로드 <span className="text-red-400 font-bold">*</span>
          </label>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {!imageUrl ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleTriggerUpload}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all h-24 ${
                isDragOver 
                  ? "border-emerald-500 bg-emerald-500/5" 
                  : "border-neutral-800 bg-neutral-950/20 hover:border-neutral-700 hover:bg-neutral-900/10"
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-400 mb-1" />
              <p className="text-[11px] font-medium text-neutral-300 text-center px-2 leading-snug">
                클릭하거나 스크린 타임 '하루 평균' 수치가 나타난 증빙 사진을 놓아 업로드하세요
              </p>
              {compressionStatus && (
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 justify-center">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse animate-duration-750"></span>
                  {compressionStatus}
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-neutral-850 bg-neutral-950/50 p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div 
                  className="relative group cursor-zoom-in w-12 h-12 flex-shrink-0"
                  onClick={() => setIsImageModalOpen(true)}
                  title="클릭하여 원본 크기로 확대 보기"
                >
                  <img 
                    src={imageUrl} 
                    alt="인증 미리보기" 
                    className="w-full h-full rounded object-cover border border-neutral-800 group-hover:brightness-90 transition-all duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div 
                  className="min-w-0 cursor-pointer hover:opacity-80 transition-opacity flex-1"
                  onClick={() => setIsImageModalOpen(true)}
                  title="클릭하여 원본 크기로 확대 보기"
                >
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>주간 증명 첨부 완료</span>
                    <span className="text-[9px] text-neutral-500 font-normal underline decoration-neutral-600">(확대 가능)</span>
                  </p>
                  <p className="text-xs text-neutral-200 font-mono truncate max-w-[200px]" title={imageName}>
                    {imageName || "screenshot.jpg"}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="p-1 px-3 border border-neutral-800 bg-neutral-900 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 font-semibold text-[10px] rounded cursor-pointer transition-all active:scale-95 flex-shrink-0"
                title="사진 취소"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* WEEKLY NOTES */}
        <div className="space-y-1">
          <label htmlFor="notes" className="text-xs font-semibold text-neutral-400 tracking-wider block">
            한 줄 메모 / 소감 <span className="text-neutral-600 font-normal">(선택)</span>
          </label>
          <textarea
            id="notes"
            rows={1.5}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setIsDirty(true);
            }}
            className="w-full bg-neutral-950/40 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
            placeholder="예시: 일주일 스마트폰 사용 시간 제한에 집중하여 유의미한 수치 감량을 유지했습니다!"
          />
        </div>

        {/* VALIDATION STATUS */}
        {validationError && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* PRIMARY SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:opacity-95 focus:outline-none hover:shadow-xl active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <ClipboardList className="w-4 h-4" />
          <span>일주일 평균 사용 시간 등록하기</span>
        </button>

      </form>

      {/* IMAGE ENLARGEMENT LIGHTBOX MODAL */}
      {isImageModalOpen && imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-250"
          onClick={() => setIsImageModalOpen(false)}
        >
          {/* Transparent Backdrop Close Button (Whole Screen) */}
          <button
            type="button"
            className="absolute top-4 right-4 p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer z-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageModalOpen(false);
            }}
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal content container */}
          <div 
            className="relative max-w-full max-h-[85vh] md:max-w-4xl flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 p-1 md:p-1.5 shadow-2xl">
              <img 
                src={imageUrl} 
                alt="주간 스크린샷 증명 원본" 
                className="max-w-[92vw] max-h-[75vh] md:max-w-3xl md:max-h-[78vh] rounded-xl object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {imageName && (
              <p className="text-[11px] text-neutral-400 font-mono text-center truncate max-w-xs md:max-w-md bg-neutral-900/95 px-3.5 py-1.5 rounded-full border border-neutral-800/80 shadow-md">
                {imageName}
              </p>
            )}
            <button
              type="button"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md"
              onClick={() => setIsImageModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
