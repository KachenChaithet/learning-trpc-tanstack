import AppHeader from "@/app/components/app-header"
import { requireAuth } from "@/lib/auth-utils"

const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireAuth()

    return (
        <>
            <AppHeader />
            <main className="flex-1">{children}</main>
        </>
    )
}

export default Layout