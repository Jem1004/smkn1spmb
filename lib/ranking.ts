import { Student, StudentWithRanking, MajorType, StudentStatus } from '@/types'

// Kuota penerimaan per jurusan
export const MAJOR_QUOTAS: Record<MajorType, number> = {
  'Teknik Kendaraan Ringan Otomotif': 36,
  'Teknik Alat Berat': 36,
  'Teknik Komputer dan Jaringan': 36,
  'Akuntansi dan Keuangan Lembaga': 36,
  'Asisten Keperawatan': 36,
  'Agribisnis Ternak Ruminansia': 36,
};

// Status penerimaan
export type AcceptanceStatus = 'DITERIMA' | 'TIDAK_DITERIMA';

// Interface untuk ranking siswa
export interface StudentRanking {
  studentId: string;
  nisn: string;
  fullName: string;
  selectedMajor: string;
  academicScore: number;
  academicAchievementPoints: number;
  nonAcademicAchievementPoints: number;
  certificatePoints: number;
  accreditationPoints: number;
  totalScore: number;
  rank: number;
  status: AcceptanceStatus;
  finalStatus?: StudentStatus | null;
}

// Fungsi untuk menghitung total skor siswa
export function calculateStudentScore(student: StudentWithRanking): number {
  if (!student.ranking) {
    return 0;
  }
  
  const { ranking } = student;
  
  // Hitung rata-rata akademik
  const academicScores = [
    ranking.mathScore,
    ranking.indonesianScore,
    ranking.englishScore,
    ranking.scienceScore
  ];
  const academicAverage = academicScores.reduce((sum, score) => sum + score, 0) / academicScores.length;
  
  // Hitung poin prestasi
  const achievementPoints = calculateAchievementPoints(
    ranking.academicAchievement,
    ranking.nonAcademicAchievement,
    ranking.certificateScore
  );
  
  // Hitung poin akreditasi
  const accreditationPoints = calculateAccreditationPoints(ranking.accreditation);
  
  return Math.round((academicAverage + achievementPoints + accreditationPoints) * 100) / 100;
}

// Fungsi untuk menghitung poin prestasi
function calculateAchievementPoints(
  academic: string,
  nonAcademic: string,
  certificate: string
): number {
  const getPoints = (level: string): number => {
    switch (level) {
      case 'Internasional': return 30;
      case 'Nasional': return 25;
      case 'Provinsi': return 20;
      case 'Kabupaten/Kota': return 15;
      case 'Kecamatan': return 10;
      case 'Sekolah': return 5;
      default: return 0;
    }
  };
  
  return getPoints(academic) + getPoints(nonAcademic) + getPoints(certificate);
}

// Fungsi untuk menghitung poin akreditasi
function calculateAccreditationPoints(accreditation: string): number {
  switch (accreditation) {
    case 'A': return 10;
    case 'B': return 5;
    case 'C':
    case 'Belum Terakreditasi':
    default: return 0;
  }
}

// Fungsi untuk membuat ranking per jurusan
export function createMajorRankings(students: StudentWithRanking[]): Record<MajorType, StudentRanking[]> {
  const rankings: Record<MajorType, StudentRanking[]> = {
    'Teknik Kendaraan Ringan Otomotif': [],
    'Teknik Alat Berat': [],
    'Teknik Komputer dan Jaringan': [],
    'Akuntansi dan Keuangan Lembaga': [],
    'Asisten Keperawatan': [],
    'Agribisnis Ternak Ruminansia': [],
  };
  
  // Kelompokkan siswa berdasarkan jurusan pilihan
  students.forEach(student => {
    if (student.selectedMajor && rankings[student.selectedMajor as MajorType]) {
      const totalScore = calculateStudentScore(student);
      
      rankings[student.selectedMajor as MajorType].push({
        studentId: student.id,
        nisn: student.nisn || '',
        fullName: student.fullName,
        selectedMajor: student.selectedMajor,
        academicScore: student.ranking?.mathScore || 0,
        academicAchievementPoints: 0,
        nonAcademicAchievementPoints: 0,
        certificatePoints: 0,
        accreditationPoints: 0,
        totalScore,
        rank: 0, // akan diisi setelah sorting
        status: 'TIDAK_DITERIMA', // default, akan diupdate
        finalStatus: student.finalStatus,
      });
    }
  });
  
  // Sort dan tentukan ranking untuk setiap jurusan
  Object.keys(rankings).forEach(major => {
    const majorKey = major as MajorType;
    
    // Sort berdasarkan skor tertinggi
    rankings[majorKey].sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign ranking dan status
    rankings[majorKey].forEach((student, index) => {
      student.rank = index + 1;

      if (student.finalStatus) {
        if (student.finalStatus === 'APPROVED') {
          student.status = 'DITERIMA';
        } else { // REJECTED or WAITLIST
          student.status = 'TIDAK_DITERIMA';
        }
      } else {
        const quota = MAJOR_QUOTAS[majorKey];
        if (index < quota) {
          student.status = 'DITERIMA';
        } else {
          student.status = 'TIDAK_DITERIMA';
        }
      }
    });
  });
  
  return rankings;
}

// Fungsi untuk mendapatkan status penerimaan siswa
export function getStudentAcceptanceStatus(
  studentId: string,
  rankings: Record<MajorType, StudentRanking[]>
): { status: AcceptanceStatus; rank: number; totalScore: number; major: MajorType } | null {
  for (const [major, studentList] of Object.entries(rankings)) {
    const student = studentList.find(s => s.studentId === studentId);
    if (student) {
      return {
        status: student.status,
        rank: student.rank,
        totalScore: student.totalScore,
        major: major as MajorType
      };
    }
  }
  return null;
}

// Fungsi untuk mendapatkan statistik penerimaan per jurusan
export function getMajorStatistics(rankings: Record<MajorType, StudentRanking[]>) {
  const statistics: Record<MajorType, {
    totalApplicants: number;
    accepted: number;
    rejected: number;
    quota: number;
    highestScore: number;
    lowestAcceptedScore: number;
  }> = {} as any;
  
  Object.entries(rankings).forEach(([major, students]) => {
    const majorKey = major as MajorType;
    const accepted = students.filter(s => s.status === 'DITERIMA');
    const rejected = students.filter(s => s.status === 'TIDAK_DITERIMA');
    
    statistics[majorKey] = {
      totalApplicants: students.length,
      accepted: accepted.length,
      rejected: rejected.length,
      quota: MAJOR_QUOTAS[majorKey],
      highestScore: students.length > 0 ? students[0].totalScore : 0,
      lowestAcceptedScore: accepted.length > 0 ? accepted[accepted.length - 1].totalScore : 0
    };
  });
  
  return statistics;
}

// Fungsi untuk export data ranking ke CSV
export function exportRankingToCSV(rankings: Record<MajorType, StudentRanking[]>): string {
  let csv = 'Jurusan,Ranking,Nama,Total Skor,Status\n';
  
  Object.entries(rankings).forEach(([major, students]) => {
    students.forEach(student => {
      csv += `"${major}",${student.rank},"${student.fullName}",${student.totalScore},${student.status}\n`;
    });
  });
  
  return csv;
}