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
import { List } from "../entities/List";
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
    const project = await Project.findOne({
      where: [{ id }, { ownerId: userId }],
    });

    return project;
  }

  @Mutation(() => Project)
  @UseMiddleware(isAuth)
  async createProject(
    @Arg("options") options: ProjectInput,
    @Ctx() { req }: MyContext
  ): Promise<Project> {
    const userId = req.session.userId;

    const project = await Project.create({
      ...options,
      ownerId: userId,
    }).save();

    const newProjectLists = ["To Do", "In Progress", "Done"].map(
      (name, index) => {
        return List.create({ name, order: index + 1, projectId: project.id });
      }
    );

    await List.save(newProjectLists);

    return project;
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
