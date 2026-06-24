export interface ScreenTimeEntry {
  id: string;
  date: string;         // e.g., "2026-06-13" or full timestamp
  timestamp: number;    // epoch time for sorting
  hours: number;
  minutes: number;
  notes?: string;
  imageUrl?: string;    // Base64 data-URL of uploaded screen-time image
  imageName?: string;   // Name of the uploaded file
}

export interface UserInfo {
  grade: string;        // e.g. "1" (학년)
  classGroup: string;   // e.g. "3" (반)
  number: string;       // e.g. "15" (번호)
  name: string;         // e.g. "홍길동" (이름)
}

export interface ClassmateRank {
  id: string;
  name: string;
  number: string;       // 번호
  avgMinutes: number;   // 평균 사용시간 (분 단위)
  isUser?: boolean;     // 사용자 본인 여부
  trend?: "up" | "down" | "same";
}

export interface StudentProfile {
  id: string;
  userInfo: UserInfo;
  entries: ScreenTimeEntry[];
  username?: string;
  password?: string;
}

