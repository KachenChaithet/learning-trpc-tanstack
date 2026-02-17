import { requireUnauth } from "@/lib/auth-utils";
import AuthLayout from "../features/auth/components/auth-layout"

const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireUnauth();

    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    )
}

export default Layout