import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      role: string
      email: string
      name: string
    }
  }

  interface User {
    id: string
    username: string
    role: string
    email: string
    name: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
  }
}