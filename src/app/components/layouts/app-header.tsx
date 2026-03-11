import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppHeaderContainer } from "../headers/app-header-container"

const AppHeader = () => {


    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">

            <SidebarTrigger />
            <AppHeaderContainer />
        </header>
    )
}
export default AppHeader