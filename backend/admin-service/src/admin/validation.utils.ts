export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNombre(nombre: string): boolean {
  if (!nombre || nombre.trim().length < 2) {
    return false;
  }
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return nombreRegex.test(nombre.trim());
}