"use client"
import { ProjectCard, ProjectCardAdd, ProjectContainer, ProjectList, projects } from "@/app/features/projects/components/projects"
import { Suspense, useState } from "react"

const ProjectPage = () => {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <ProjectContainer search={searchTerm} setSearch={setSearchTerm}>
            <Suspense fallback={<p>Loading...</p>}>
                <ProjectList search={searchTerm} />
            </Suspense>
        </ProjectContainer >
    )
}
export default ProjectPage