"use client"
import { ProjectCard, ProjectCardAdd, ProjectContainer, projects } from "@/app/features/projects/components/projects"

const ProjectPage = () => {

    return (
        <ProjectContainer>
            <>
                {projects.map((project) => (
                    <ProjectCard
                        title={project.title}
                        description={project.description}
                        avatars={project.avatars}
                        dueDate={project.dueDate}
                        extraMembers={project.extraMembers}
                        progress={project.progress}
                        key={project.dueDate}
                    />

                ))}
                <ProjectCardAdd />
            </>
        </ProjectContainer>
    )
}
export default ProjectPage