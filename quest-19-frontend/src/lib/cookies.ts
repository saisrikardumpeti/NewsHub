export interface UserPreferences {
  sources: string[]
  categories: string[]
}

export const cookieUtils = {
  set: (name: string, value: any, days = 30) => {
    if (typeof document === "undefined") return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`
  },

  get: (name: string) => {
    if (typeof document === "undefined") return null

    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(c.substring(nameEQ.length, c.length))
        } catch {
          return null
        }
      }
    }
    return null
  },

  delete: (name: string) => {
    if (typeof document === "undefined") return
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  },
}
