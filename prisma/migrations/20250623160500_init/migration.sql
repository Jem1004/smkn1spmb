-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "birthPlace" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "religion" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rt" TEXT,
    "rw" TEXT,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "fatherName" TEXT NOT NULL,
    "fatherJob" TEXT,
    "fatherPhone" TEXT,
    "motherName" TEXT NOT NULL,
    "motherJob" TEXT,
    "motherPhone" TEXT,
    "guardianName" TEXT,
    "guardianJob" TEXT,
    "guardianPhone" TEXT,
    "parentAddress" TEXT,
    "previousSchool" TEXT NOT NULL,
    "nisn" TEXT,
    "graduationYear" INTEGER NOT NULL,
    "firstMajor" TEXT NOT NULL,
    "secondMajor" TEXT,
    "thirdMajor" TEXT,
    "hasIjazah" BOOLEAN NOT NULL DEFAULT false,
    "hasSKHUN" BOOLEAN NOT NULL DEFAULT false,
    "hasKK" BOOLEAN NOT NULL DEFAULT false,
    "hasAktaLahir" BOOLEAN NOT NULL DEFAULT false,
    "hasFoto" BOOLEAN NOT NULL DEFAULT false,
    "hasRaport" BOOLEAN NOT NULL DEFAULT false,
    "hasSertifikat" BOOLEAN NOT NULL DEFAULT false,
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rankings" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "indonesianScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "englishScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mathScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scienceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificateScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "achievementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "students"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "rankings_studentId_key" ON "rankings"("studentId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
