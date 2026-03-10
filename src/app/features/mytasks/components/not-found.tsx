import { Button } from "@/components/ui/button"
import { PanelsTopLeft, SearchX, TextAlignJustify } from "lucide-react"
import Link from "next/link"

const NotFound = () => {
    return (
        <div className=" mt-50 min-w-full flex flex-col justify-center items-center text-center gap-4">
            <div className="">
                <div className="bg-primary/20 p-10 rounded-full">
                    <SearchX className="text-primary/60 size-20" />
                </div>

            </div>
            <h1 className="font-semibold text-2xl">404 - Task Not Found</h1>
            <p className=" text-lg text-muted-foreground max-w-160 font-medium">
                Oops! The task you are looking for migth have been deleted moved to a different project, or the link you followed is incorrect.
            </p>
            <div className="flex gap-2">
                <Button
                    size={'lg'}
                    asChild
                >
                    <Link href={'/dashboard'}>
                        <PanelsTopLeft />
                        Back to Dashbaord
                    </Link>
                </Button>

                <Button
                    variant={'outline'}
                    size={'lg'}
                    asChild
                >
                    <Link href={'/my-tasks'}>
                        <TextAlignJustify />
                        View My Tasks
                    </Link>
                </Button>
            </div>
        </div>
    )
}
export default NotFound