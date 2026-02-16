"use client"
import { trpc } from "@/trpc/client"

const HomeContents = () => {
    const { data, error, isLoading } = trpc.hello.useQuery({ text: 'kachen' })
    if (isLoading) return <>Loading...</>

    if (error) return <>Error...</>


    return (
        <div>
            {data?.greeting}
        </div>
    )
}
export default HomeContents