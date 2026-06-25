import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { StudentProfile, UserInfo, ScreenTimeEntry } from "../types";

// Firebase App Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBEsnbmTTionH1sD8vqbEZW37hwT3n_A10",
  authDomain: "gen-lang-client-0000461267.firebaseapp.com",
  projectId: "gen-lang-client-0000461267",
  storageBucket: "gen-lang-client-0000461267.firebasestorage.app",
  messagingSenderId: "1052371461879",
  appId: "1:1052371461879:web:092f491c7a59bc41f495f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-159bfa41-7a3a-4f1d-a97a-dcb02885bb50");

// Firestore Collection Reference
const COLLECTION_NAME = "participants";
const participantsRef = collection(db, COLLECTION_NAME);

/**
 * Generate standard template entries for a new user
 */
const generateTimestamp = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
};

const NEW_PROFILE_TEMPLATE_ENTRIES: ScreenTimeEntry[] = [
  { id: "t-1", date: "2026-06-21", timestamp: generateTimestamp("2026-06-21"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-2", date: "2026-06-22", timestamp: generateTimestamp("2026-06-22"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-3", date: "2026-06-23", timestamp: generateTimestamp("2026-06-23"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-4", date: "2026-06-24", timestamp: generateTimestamp("2026-06-24"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-5", date: "2026-06-25", timestamp: generateTimestamp("2026-06-25"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-6", date: "2026-06-26", timestamp: generateTimestamp("2026-06-26"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" },
  { id: "t-7", date: "2026-06-27", timestamp: generateTimestamp("2026-06-27"), hours: 0, minutes: 0, notes: "하루 평균 스크린타임 입력 대기 중" }
];

/**
 * Subscribe to all participants' screen time profiles in real-time
 */
export function subscribeToProfiles(onUpdate: (profiles: StudentProfile[]) => void, onError: (err: Error) => void) {
  return onSnapshot(
    participantsRef,
    (snapshot) => {
      const profiles: StudentProfile[] = [];
      snapshot.forEach((doc) => {
        profiles.push(doc.data() as StudentProfile);
      });
      onUpdate(profiles);
    },
    (err) => {
      console.error("Firestore subscription error:", err);
      onError(err);
    }
  );
}

/**
 * Handle student signup
 */
export async function signUpStudent(signUpData: {
  grade: string;
  classGroup: string;
  number: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
  try {
    // 1. Check if same student (grade, classGroup, number) already exists
    const q = query(
      participantsRef,
      where("userInfo.grade", "==", signUpData.grade),
      where("userInfo.classGroup", "==", signUpData.classGroup),
      where("userInfo.number", "==", signUpData.number)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: "이미 등록되어 있는 학년, 반, 번호입니다." };
    }

    // 2. Generate a new custom document key (or let Firestore generate one)
    const newDocRef = doc(participantsRef);
    const id = newDocRef.id;

    // 3. Create full student profile object
    const newProfile: StudentProfile = {
      id,
      userInfo: {
        grade: signUpData.grade,
        classGroup: signUpData.classGroup,
        number: signUpData.number,
        name: signUpData.name
      },
      entries: NEW_PROFILE_TEMPLATE_ENTRIES,
      password: signUpData.password
    };

    // 4. Save to Firestore
    await setDoc(newDocRef, newProfile);
    return { success: true, profile: newProfile };
  } catch (err: any) {
    console.error("Firebase signup error:", err);
    return { success: false, error: err.message || "회원가입 처리 중 오류가 발생했습니다." };
  }
}

/**
 * Handle student login
 */
export async function loginStudent(
  grade: string,
  classGroup: string,
  number: string,
  passwordInput: string
): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
  try {
    const q = query(
      participantsRef,
      where("userInfo.grade", "==", grade),
      where("userInfo.classGroup", "==", classGroup),
      where("userInfo.number", "==", number)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: "등록된 학급 번호가 존재하지 않습니다. 회원가입을 먼저 해주세요." };
    }

    let matchedProfile: StudentProfile | null = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StudentProfile;
      if (data.password === passwordInput) {
        matchedProfile = data;
      }
    });

    if (!matchedProfile) {
      return { success: false, error: "비밀번호가 올바르지 않습니다." };
    }

    return { success: true, profile: matchedProfile };
  } catch (err: any) {
    console.error("Firebase login error:", err);
    return { success: false, error: err.message || "로그인 처리 중 오류가 발생했습니다." };
  }
}

/**
 * Update user information
 */
export async function updateStudentInfo(id: string, userInfo: UserInfo): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, { userInfo }, { merge: true });
}

/**
 * Update screen time entries for a student
 */
export async function updateStudentEntries(id: string, entries: ScreenTimeEntry[]): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, { entries }, { merge: true });
}

/**
 * Delete a student profile
 */
export async function deleteStudentProfile(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
