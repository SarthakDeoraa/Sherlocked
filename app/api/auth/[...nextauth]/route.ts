import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (!profile?.email) {
                return false
            }

            try {
                await prisma.user.upsert({
                    where: { email: profile.email },
                    update: {
                        name: profile.name
                    },
                    create: {
                        email: profile.email,
                        name: profile.name
                    },
                })
                return true
            } catch (error) {
                console.error('Error during sign in:', error)
                return false
            }
        },

        async session({ session, token }) {
            if (token.id && session.user) {
                (session.user as any).id = token.id as string
            }
            return session
        },

        async jwt({ token, profile }) {
            if (profile) {
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: profile.email,
                        },
                    })

                    if (!user) {
                        throw new Error('No user found')
                    }

                    token.id = user.id
                } catch (error) {
                    console.error('Error in JWT callback:', error)
                }
            }

            return token
        },
        async redirect({ baseUrl }) {
            return `${baseUrl}/setup`
        }
        }
    }


// Export the NextAuth handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Also export authOptions if you need it elsewhere
export { authOptions }