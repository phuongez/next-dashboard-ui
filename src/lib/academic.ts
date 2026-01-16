export type SubjectScoreInput = {
  subjectId: string;
  subjectName: string;
  examScores: number[];
  assignmentScores: number[];
};

export type AcademicStatus = "NO_DATA" | "IN_PROGRESS" | "EVALUATED";

export type AcademicResult = {
  status: AcademicStatus;
  subjectCount: number;
  academicAvg: number | null;
  level: "Giỏi" | "Khá" | "Trung bình" | "Chưa đánh giá";
  subjects: {
    subjectId: string;
    subjectName: string;
    subjectAvg: number | null;
  }[];
};

// src/lib/academic.ts

const EXAM_WEIGHT = 0.4;
const ASSIGNMENT_WEIGHT = 0.6;

function getAcademicLevel(avg: number) {
  if (avg >= 8) return "Giỏi";
  if (avg >= 6) return "Khá";
  return "Trung bình";
}

export function calculateAcademic(
  subjects: SubjectScoreInput[],
  options?: {
    minSubjectsToEvaluate?: number; // ví dụ: >= 3 môn mới xếp loại
  }
): AcademicResult {
  const minSubjects = options?.minSubjectsToEvaluate ?? 1;

  if (subjects.length === 0) {
    return {
      status: "NO_DATA",
      subjectCount: 0,
      academicAvg: null,
      level: "Chưa đánh giá",
      subjects: [],
    };
  }

  // 1. Tính điểm từng môn
  const calculatedSubjects = subjects.map((s) => {
    const hasScore = s.examScores.length > 0 || s.assignmentScores.length > 0;

    if (!hasScore) {
      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectAvg: null,
      };
    }

    const examAvg =
      s.examScores.length > 0
        ? s.examScores.reduce((a, b) => a + b, 0) / s.examScores.length
        : 0;

    const assignmentAvg =
      s.assignmentScores.length > 0
        ? s.assignmentScores.reduce((a, b) => a + b, 0) /
          s.assignmentScores.length
        : 0;

    const subjectAvg =
      examAvg * EXAM_WEIGHT + assignmentAvg * ASSIGNMENT_WEIGHT;

    return {
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      subjectAvg: Number(subjectAvg.toFixed(2)),
    };
  });

  // 2. Lọc môn hợp lệ
  const validSubjects = calculatedSubjects.filter((s) => s.subjectAvg !== null);

  if (validSubjects.length === 0) {
    return {
      status: "NO_DATA",
      subjectCount: 0,
      academicAvg: null,
      level: "Chưa đánh giá",
      subjects: calculatedSubjects,
    };
  }

  if (validSubjects.length < minSubjects) {
    return {
      status: "IN_PROGRESS",
      subjectCount: validSubjects.length,
      academicAvg: null,
      level: "Chưa đánh giá",
      subjects: calculatedSubjects,
    };
  }

  // 3. Tính học lực chung
  const academicAvg =
    validSubjects.reduce((sum, s) => sum + (s.subjectAvg as number), 0) /
    validSubjects.length;

  return {
    status: "EVALUATED",
    subjectCount: validSubjects.length,
    academicAvg: Number(academicAvg.toFixed(2)),
    level: getAcademicLevel(academicAvg),
    subjects: calculatedSubjects,
  };
}
