import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { List } from "../entities/List";
import { Project } from "../entities/Project";
import { isAuth } from "../middleware/isAuth";

@Resolver(List)
export class ListResolver {
  @Query(() => [List])
  lists(): Promise<List[]> {
    return List.find();
  }

  @Query(() => List, { nullable: true })
  list(@Arg("listId", () => Int) listId: number): Promise<List | undefined> {
    return List.findOne(listId);
  }

  @Mutation(() => List)
  @UseMiddleware(isAuth)
  async createList(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("name") name: string
  ): Promise<List | undefined> {
    let project;

    try {
      project = await Project.findOneOrFail(projectId);

      return List.create({ name, project }).save();
    } catch (error) {
      console.log("error: ", error);
      return;
    }
  }

  @Mutation(() => List)
  @UseMiddleware(isAuth)
  async updateList(
    @Arg("listId", () => Int) listId: number,
    // TODO: adjust Args to permit optionals
    @Arg("name") name: string,
    @Arg("archived") archived: boolean
  ): Promise<List | undefined> {
    let list;
    try {
      list = await List.findOneOrFail(listId);
      list.name = name || list.name;
      list.archived = archived ?? list.archived;
      await list.save();
    } catch (error) {
      console.log("error: ", error);
      return;
    }

    return list;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteList(@Arg("listId", () => Int) listId: number): Promise<boolean> {
    return Boolean((await List.delete(listId)).affected);
  }
}
