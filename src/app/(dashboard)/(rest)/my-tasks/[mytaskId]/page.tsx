import { TaskDetailContainer } from "@/app/features/mytasks/components/task-detail"

type PageProps = {
    params: Promise<{
        mytaskId: string
    }>
}
const page = async ({ params }: PageProps) => {
    const { mytaskId } = await params
    return (
        <TaskDetailContainer>
            <h1>{mytaskId}</h1>
        </TaskDetailContainer>
    )
}
export default page