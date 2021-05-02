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
  async projects(@Ctx() { req }: MyContext): Promise<Project[]> {
    const userId = req.session.userId;

    const projects = await Project.find({
      where: [{ ownerId: userId }],
    });

    return projects;
  }

  @Query(() => Project, { nullable: true })
  async project(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Project | undefined> {
    const userId = req.session.userId;

    return await Project.findOne({ where: [{ id }, { ownerId: userId }] });
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
