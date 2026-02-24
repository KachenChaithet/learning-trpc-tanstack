"use client"
import { ProjectCard, ProjectCardAdd, ProjectContainer, ProjectList, projects } from "@/app/features/projects/components/projects"
import { Suspense } from "react"

const ProjectPage = () => {

    return (
        <ProjectContainer>
            <Suspense fallback={<p>Loading...</p>}>

                <ProjectList />
            </Suspense>
        </ProjectContainer >
    )
}
export default ProjectPage