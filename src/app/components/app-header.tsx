import { SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"

const AppHeader = () => {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <Image src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQanlasPgQjfGGU6anray6qKVVH-ZlTqmuTHw&s'} alt="image profile" width={32} height={32} />
        </header>
    )
}
export default AppHeader