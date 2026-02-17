import SignupForm from "@/app/features/auth/components/register-form"
import { requireUnauth } from "@/lib/auth-utils";

const SingupPage = async () => {
    return (
        <>
            <SignupForm />
        </>
    )
}
export default SingupPage