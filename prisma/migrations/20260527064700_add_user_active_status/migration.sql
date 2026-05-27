-- Migration: add_user_active_status
-- Agrega campo active al modelo User para soporte de activación/desactivación de usuarios.
-- DEFAULT true: todos los usuarios existentes quedan activos automáticamente.

ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
