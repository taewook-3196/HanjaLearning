/** Keep grade codes in storage; use official Korean labels in the UI. */
export function gradeDisplayName(code: string | null | undefined): string {
 if (!code) return "급수";
 const normalized=code.trim().toUpperCase();
 if (normalized==="TEACHER") return "사범";
 const pre=normalized.match(/^PRE([1-9])$/);
 if (pre) return `준${pre[1]}급`;
 if (/^[1-9]$/.test(normalized)) return `${normalized}급`;
 return code;
}

export function officialGradeDisplayName(code: string | null | undefined, provider="대한검정회"): string {
 return `${provider} ${gradeDisplayName(code)}`;
}
