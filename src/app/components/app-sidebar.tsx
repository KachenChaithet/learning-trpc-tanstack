"use client"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSubItem, SidebarTrigger } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { ActivityIcon, CheckSquareIcon, FolderKanbanIcon, LayoutDashboardIcon, LogOutIcon, PlugIcon, SettingsIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

const menuItems = [
    {
        title: "Workspace",
        items: [
            {
                title: "Dashboard",
                icon: LayoutDashboardIcon,
                url: "/dashboard"
            },
            {
                title: "Projects",
                icon: FolderKanbanIcon,
                url: "/projects"
            },
            {
                title: "My Tasks",
                icon: CheckSquareIcon,
                url: "/my-tasks"
            },
        ]
    },
    // {
    //     title: "Management",
    //     items: [
    //         {
    //             title: "Members",
    //             icon: UsersIcon,
    //             url: "/members"
    //         },
    //         {
    //             title: "Roles & Permissions",
    //             icon: ShieldCheckIcon,
    //             url: "/roles"
    //         },
    //         {
    //             title: "Activity Log",
    //             icon: ActivityIcon,
    //             url: "/activity"
    //         },
    //     ]
    // },
    // {
    //     title: "Settings",
    //     items: [
    //         {
    //             title: "Workspace Settings",
    //             icon: SettingsIcon,
    //             url: "/settings"
    //         },
    //         {
    //             title: "Integrations",
    //             icon: PlugIcon,
    //             url: "/integrations"
    //         }
    //     ]
    // }
]


const AppSidebar = () => {
    const router = useRouter()
    const pathname = usePathname()
    console.log(menuItems[0]);


    return (
        <Sidebar collapsible="icon" className="bg-background">
            <SidebarHeader>
                <SidebarMenuItem>

                    <SidebarMenuButton
                        tooltip={'Planora'}
                        asChild
                        className="gap-x-4 h-10 px-4"
                    >
                        <Link
                            href={"/"}
                            prefetch
                        >
                            <Image src={'/logos/logoipsum-389.svg'} alt="Nodebase" width={30} height={30} />
                            <span className="font-semibold text-sm">Planora</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            {group.items.map((item) => (
                                <SidebarMenu key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={
                                            item.url === "/"
                                                ? pathname === "/"
                                                : pathname.startsWith(item.url)
                                        }
                                        className="gap-x-4 h-10 px-4 "
                                        asChild
                                    >
                                        <Link href={item.url} prefetch>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>

                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenu>
                            ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuSubItem>
                        <SidebarMenuButton
                            tooltip={"Sign Out"}
                            className="gap-x-4 h-10 px-4"
                            onClick={() => {
                                authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            router.push('/login')
                                            toast.success('Signout success')
                                        },
                                    }
                                })
                            }}>
                            <LogOutIcon className="h-4 w-4" />
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuSubItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar>
    )
}
export default AppSidebar