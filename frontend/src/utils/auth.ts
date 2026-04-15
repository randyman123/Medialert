export type UserRole = 'ADMIN' | 'RECEPCION' | 'MEDICO' | 'PACIENTE' | null

interface JwtPayload {
  rol?: unknown
  nombre?: unknown
  nombreCompleto?: unknown
  correo?: unknown
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  return atob(normalized)
}

export function getRoleFromToken(token: string | null): UserRole {
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return null
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as JwtPayload

    if (
      parsed.rol === 'ADMIN' ||
      parsed.rol === 'RECEPCION' ||
      parsed.rol === 'MEDICO' ||
      parsed.rol === 'PACIENTE'
    ) {
      return parsed.rol
    }
  } catch {
    return null
  }

  return null
}

export function formatUserName(value: string) {
  const normalized = value
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .trim()

  if (!normalized) {
    return 'Usuario'
  }

  return normalized
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function getUserNameFromToken(token: string | null) {
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return null
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as JwtPayload

    if (typeof parsed.nombreCompleto === 'string' && parsed.nombreCompleto.trim()) {
      return parsed.nombreCompleto.trim()
    }

    if (typeof parsed.nombre === 'string' && parsed.nombre.trim()) {
      return parsed.nombre.trim()
    }

    if (typeof parsed.correo === 'string' && parsed.correo.trim()) {
      return formatUserName(parsed.correo)
    }
  } catch {
    return null
  }

  return null
}

export function canViewMisReservas(role: UserRole) {
  return role === 'PACIENTE'
}

export function canManagePatientContent(role: UserRole) {
  return role === 'PACIENTE'
}

export function canAccessTelemedicina(role: UserRole) {
  return role === 'PACIENTE' || role === 'RECEPCION'
}
