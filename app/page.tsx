import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as needed

export default async function Home() {
    const session = await getServerSession(authOptions);
    
    return (
        <div className="">
            {session ? (
                <div>
                    <h1>Welcome, {session.user?.name || session.user?.email}</h1>
                    <p>Session data:</p>
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                </div>
            ) : (
                <div>
                    <h1>Not signed in</h1>
                    <p>Please sign in to continue</p>
                </div>
            )}
        </div>
    );
}
