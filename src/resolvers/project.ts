import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Project } from "../entities/Project";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@InputType()
class ProjectInput {
  @Field()
  name: string;

  @Field()
  description: string;
}

@Resolver(Project)
export class ProjectResolver {
  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    const projects = await Project.find();

    return projects;
  }

  @Query(() => Project, { nullable: true })
  async project(
    @Arg("id", () => Int) id: number
  ): Promise<Project | undefined> {
    return await Project.findOne(id);
  }

  @Mutation(() => Project)
  @UseMiddleware(isAuth)
  async createProject(
    @Arg("options") options: ProjectInput,
    @Ctx() { req }: MyContext
  ): Promise<Project | undefined> {
    return Project.create({
      ...options,
      ownerId: req.session.userId,
    }).save();
  }

  @Mutation(() => Project)
  @UseMiddleware(isAuth)
  async updateProject(
    @Arg("projectId") projectId: number,
    @Arg("options") { name, description }: ProjectInput
  ): Promise<Project | undefined> {
    let project;
    try {
      project = await Project.findOneOrFail(projectId);
      project.name = name || project.name;
      project.description = description || project.description;
      await project.save();
    } catch (error) {
      console.log("error: ", error);
      return;
    }

    return project;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProject(@Arg("projectId") projectId: number): Promise<boolean> {
    return Boolean((await Project.delete(projectId)).affected);
  }
}
