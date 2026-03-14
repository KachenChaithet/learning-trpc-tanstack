"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersSettings } from "./settings-members"
import { GeneralSettings } from "./settings-general"

interface Props {
    projectId: string
}

export const ProjectSettingsContainer = ({ projectId }: Props) => {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Project Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your project settings and members</p>
            </div>

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <GeneralSettings projectId={projectId} />
                </TabsContent>

                <TabsContent value="members">
                    <MembersSettings projectId={projectId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}