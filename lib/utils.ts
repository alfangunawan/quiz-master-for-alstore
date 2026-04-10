import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQuizCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function calculateScore(
  isCorrect: boolean,
  timeSpent: number,
  timeLimit: number,
  basePoints: number = 1000,
  streak: number = 0
): number {
  if (!isCorrect) return 0;
  const timeBonus = Math.round(
    ((timeLimit - timeSpent) / timeLimit) * 500
  );
  const streakBonus = streak >= 3 ? 100 : 0;
  return basePoints + Math.max(0, timeBonus) + streakBonus;
}

export function getGrade(accuracy: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (accuracy >= 90)
    return { label: "Excellent", emoji: "🏆", color: "#FFD700" };
  if (accuracy >= 70)
    return { label: "Good", emoji: "⭐", color: "#00B894" };
  if (accuracy >= 50)
    return { label: "Fair", emoji: "👍", color: "#FDCB6E" };
  return { label: "Try Again", emoji: "💪", color: "#D63031" };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
