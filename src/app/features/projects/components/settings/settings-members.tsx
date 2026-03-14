"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trash2Icon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

interface Props {
    projectId: string
}

export const MembersSettings = ({ projectId }: Props) => {
    const [searchQuery, setSearchQuery] = useState("")

    const { data: members = [], refetch } = trpc.projects.getMembers.useQuery({ projectId })

    const { data: searchResults = [] } = trpc.projects.searchUsers.useQuery(
        { query: searchQuery, projectId },
        { enabled: searchQuery.length >= 2 }
    )



    // เป็น
    const inviteMember = trpc.projects.inviteUser.useMutation({
        onSuccess: () => {
            toast.success("Invite sent")  // ← เปลี่ยน message
            setSearchQuery("")
            refetch()
        },
        onError: (err) => toast.error(err.message)
    })
    const removeMember = trpc.projects.removeMember.useMutation({
        onSuccess: () => {
            toast.success("Member removed")
            refetch()
        },
        onError: (err) => toast.error(err.message)
    })

    return (
        <div className="space-y-6 mt-4">

            {/* Search & Add */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Add Member</p>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <Card className="p-2 space-y-1">
                        {searchResults.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-7">
                                        <AvatarImage src={user.image ?? ""} />
                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>


                                <Button
                                    size="sm"
                                    disabled={inviteMember.isPending}
                                    onClick={() => inviteMember.mutate({ projectId, userId: user.id })}
                                >
                                    Invite  
                                </Button>
                            </div>
                        ))}
                    </Card>
                )}
            </div>

            {/* Member List */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Members ({members.length})</p>
                <div className="space-y-2">
                    {members.map((member) => (
                        <Card key={member.userId} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                        <AvatarImage src={member.user.image ?? ""} />
                                        <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                                        {member.role}
                                    </Badge>
                                    {member.role !== "OWNER" && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600"
                                            disabled={removeMember.isPending}
                                            onClick={() => removeMember.mutate({ projectId, userId: member.userId })}
                                        >
                                            <Trash2Icon className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}