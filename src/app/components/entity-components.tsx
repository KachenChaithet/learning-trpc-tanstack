import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

type EntityContainerProps = {
    children: React.ReactNode
    header?: React.ReactNode
    search?: React.ReactNode
    statusSelect?: React.ReactNode
    ownerSelect?: React.ReactNode

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

type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
}

type EntitySelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
}


export const EntitySelect = ({
    value,
    onChange,
    options,
    placeholder = "Select",
    disabled, }: EntitySelectProps) => {
    return (
        <div className=" min-w-auto">
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="bg-background shadow-none ">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option?.disabled}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export const EntityContainer = ({ children, header, search, ownerSelect, statusSelect }: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full w-full">
            <div className="w-full flex flex-col gap-y-8 h-full">
                {header}
                <div className="flex flex-col gap-y-4 h-full w-full">
                    <div className="w-full flex gap-2 flex-wrap">
                        <div className="flex-1">
                            {search}
                        </div>

                        <div className="w-48">
                            {statusSelect}
                        </div>

                        <div className="w-48">
                            {ownerSelect}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}