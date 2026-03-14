import { ProjectSettingsContainer } from "@/app/features/projects/components/settings/settings"

interface Props {
    params: Promise<{ id: string }>
}

const page = async ({ params }: Props) => {
    const { id } = await params

    return <ProjectSettingsContainer projectId={id} />
}

export default page