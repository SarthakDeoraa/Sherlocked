import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const authOptions: NextAuthOptions = {
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
                (session.user as any).id = token.id as string;
                // Fetch user from DB to get isTeamLeader, teamId, profilePicture
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        isTeamLeader: true,
                        teamId: true,
                        profilePicture: true,
                    },
                });
                if (dbUser) {
                    (session.user as any).isTeamLeader = dbUser.isTeamLeader;
                    (session.user as any).teamId = dbUser.teamId;
                    (session.user as any).profilePicture = dbUser.profilePicture;
                }
            }
            return session;
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
        }
    }
} 