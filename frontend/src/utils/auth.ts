export type UserRole = 'ADMIN' | 'RECEPCION' | 'MEDICO' | 'PACIENTE' | null

interface JwtPayload {
  rol?: unknown
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

export function canViewMisReservas(role: UserRole) {
  return role === 'PACIENTE'
}
