"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { redirect } from "next/navigation"

const SignOut = () => {
    return (
        <Button onClick={() => {
            authClient.signOut({}, {
                onSuccess: () => {
                    redirect('/login')
                },
                onError: (err) => {
                    console.log(err.error.message);
                }
            })

        }}>
            Sign Out
        </Button>
    )
}
export default SignOut