import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

type EntityContainerProps = {
    children: React.ReactNode
    header?: React.ReactNode
    search?: React.ReactNode

}


interface EntitySearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string
}

export const EntitySearch = ({ value, onChange, placeholder = "Search" }: EntitySearchProps) => {
    return (
        <div className="relative ml-auto ">
            <SearchIcon className="size-3.5 absolute left-3 top-1/2 -grain -translate-y-1/2 text-muted-foreground" />
            <Input
                className=" bg-background shadow-none border-none pl-8"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}


export const EntityContainer = ({ children, header, search }: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full w-full">
            <div className="w-full flex flex-col gap-y-8 h-full">
                {header}
                <div className="flex flex-col gap-y-4 h-full w-full">
                    <div className="w-full">
                        {search}

                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}