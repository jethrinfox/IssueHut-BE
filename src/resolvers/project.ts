import { Arg, Int, Query, Resolver } from "type-graphql"
import { Project } from "../entities/Project"

@Resolver(Project)
export class ProjectResolver {
  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    const projects = await Project.find()

    return projects
  }

  @Query(() => Project, { nullable: true })
  async project(
    @Arg("id", () => Int) id: number,
  ): Promise<Project | undefined> {
    return await Project.findOne(id)
  }
}
