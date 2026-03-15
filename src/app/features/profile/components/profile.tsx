"use client"
import { Card } from "@/components/ui/card"
import { useProfile, useUpdateProfile } from "../hook/use-profile"
import { CheckCircleIcon, FolderIcon, ListTodoIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { mainModule } from "process"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProfileAvatarProps {
    name: string | null
    email: string
    image: string | null
}

export const ProfileAvatar = ({ email, image, name }: ProfileAvatarProps) => {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={image ?? ""} />
                    <AvatarFallback className="text-xl">{name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="">
                    <p className="text-xl font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
            </div>
        </Card>
    )
}

interface ProfileStatsProps {
    projectsJoined: number
    tasksTotal: number
    tasksCompleted: number
}
export const ProfileStats = ({ projectsJoined, tasksCompleted, tasksTotal }: ProfileStatsProps) => {
    const stats = [
        { label: "Projects Joined", value: projectsJoined, icon: FolderIcon },
        { label: "Tasks Total", value: tasksTotal, icon: ListTodoIcon },
        { label: "Tasks Completed", value: tasksCompleted, icon: CheckCircleIcon },
    ]

    return (
        <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="p-4 flex items-center gap-3">
                    <stat.icon className="size-8 text-primary" />
                    <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}
const formSchema = z.object({
    name: z.string().min(1).max(100)
})

type FormType = z.infer<typeof formSchema>

interface ProfileFormProps {
    name: string | null
}

export const ProfileForm = ({ name }: ProfileFormProps) => {
    const { mutate: updateProfile, isPending: isUpdateProfile } = useUpdateProfile()

    const form = useForm<FormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ''
        }
    })

    useEffect(() => {
        if (name) {
            form.reset({ name: name ?? "" })
        }
    }, [name, form])
    return (
        <Card className="p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => updateProfile({ name: v.name }))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button disabled={isUpdateProfile}>
                        {isUpdateProfile ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </Card>
    )
}


export const ProfileContainer = () => {
    const { data: profile, isLoading } = useProfile()
    if (isLoading) return <div>Loading...</div>
    if (!profile) return null
    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <ProfileAvatar email={profile.email ?? ""} image={profile.image ?? null} name={profile.name ?? null} />
            <ProfileStats
                projectsJoined={profile._count?.projectMembers ?? 0}
                tasksTotal={profile._count?.assignedTasks ?? 0}
                tasksCompleted={profile.completedTasks}
            />
            <ProfileForm name={profile.name ?? null } />
        </div>
    )
}