-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'RUSSIAN', 'UZBEK');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'RUB', 'UZS');

-- CreateEnum
CREATE TYPE "Timezone" AS ENUM ('America/New_York', 'Asia/Almaty', 'Asia/Dubai', 'Asia/Tashkent', 'Europe/London', 'Europe/Moscow');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "language" "Language",
    "currency" "Currency",
    "timezone" "Timezone",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
