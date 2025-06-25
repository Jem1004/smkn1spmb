/*
  Warnings:

  - You are about to drop the column `achievementScore` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `fatherPhone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `firstMajor` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `guardianPhone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `motherPhone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `previousSchool` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `secondMajor` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `thirdMajor` on the `students` table. All the data in the column will be lost.
  - Added the required column `schoolName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedMajor` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rankings" DROP COLUMN "achievementScore",
ADD COLUMN     "academicAchievement" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "accreditation" TEXT NOT NULL DEFAULT 'Belum Terakreditasi',
ADD COLUMN     "nonAcademicAchievement" TEXT NOT NULL DEFAULT 'none',
ALTER COLUMN "certificateScore" SET DEFAULT 'none',
ALTER COLUMN "certificateScore" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "fatherPhone",
DROP COLUMN "firstMajor",
DROP COLUMN "guardianPhone",
DROP COLUMN "motherPhone",
DROP COLUMN "nickname",
DROP COLUMN "phone",
DROP COLUMN "previousSchool",
DROP COLUMN "secondMajor",
DROP COLUMN "thirdMajor",
ADD COLUMN     "certificateNumber" TEXT,
ADD COLUMN     "childOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "fatherEducation" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "motherEducation" TEXT,
ADD COLUMN     "npsn" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "schoolName" TEXT NOT NULL,
ADD COLUMN     "selectedMajor" TEXT NOT NULL,
ADD COLUMN     "totalSiblings" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weight" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "nationality" SET DEFAULT 'Indonesia',
ALTER COLUMN "village" DROP NOT NULL;
