// Shared profile utilities - reads/writes from localStorage
// Used by profile page AND setup page so they share the same data

export interface ProfileData {
  role: "worker" | "client" | "";
  name: string;
  bio: string;
  walletAddress: string;
  website: string;
  twitter: string;
  skills: string;
  avatarColor: string;
  avatarUrl: string | null;
  hourlyRate: string;
  availability: string;
  verified?: boolean;
  quizPassed?: boolean;
  quizScore?: number;
}

export const DEFAULT_PROFILE: ProfileData = {
  role: "",
  name: "",
  bio: "",
  walletAddress: "",
  website: "",
  twitter: "",
  skills: "",
  avatarColor: "#00E5C3",
  avatarUrl: null,
  hourlyRate: "",
  availability: "available",
  verified: false,
  quizPassed: false,
  quizScore: undefined,
};

export function computeVerified(p: ProfileData): boolean {
  const hasWallet = !!(p.walletAddress && !p.walletAddress.startsWith("pending"));
  const hasName = p.name.trim().length >= 2;
  if (!hasWallet || !hasName) return false;
  if (p.role === "worker") {
    return p.bio.trim().length >= 15 && !!(p.skills.trim() || p.website.trim() || p.twitter.trim());
  }
  if (p.role === "client") {
    return p.bio.trim().length >= 10;
  }
  return false;
}

export function loadProfile(): ProfileData {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem("receipt_profile");
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(data: ProfileData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("receipt_profile", JSON.stringify(data));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("receipt_profile");
}

export function getInitials(name: string): string {
  if (!name.trim()) return "?";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
