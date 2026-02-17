import LoginForm from "@/app/features/auth/components/login-form"
import { requireUnauth } from "@/lib/auth-utils"

const LogingPage = async () => {
    return (
        <>
            <LoginForm />
        </>
    )
}
export default LogingPage