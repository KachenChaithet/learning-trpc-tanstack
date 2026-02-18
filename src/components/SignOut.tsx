"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { redirect } from "next/navigation"
import { toast } from "sonner"

const SignOut = () => {
    return (
        <Button onClick={() => {
            authClient.signOut({}, {
                onSuccess: () => {
                    toast.success("Logout Success")
                    redirect('/login')
                },
                onError: (err) => {
                    toast.error(err.error.message)

                }
            })


        }}
        size={'sm'}
        >
            Sign Out
        </Button>
    )
}
export default SignOut