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
import { updateOrder } from "../utils/draggableUtils";

@InputType()
class UpdateListsOrderInput {
  @Field()
  id: number;

  @Field()
  order: number;
}

@Resolver(List)
export class ListResolver {
  @Query(() => [List])
  @UseMiddleware(isAuth)
  async lists(
    @Arg("projectId", () => Int) projectId: number,
    @Ctx() { req }: MyContext
  ): Promise<List[]> {
    const userId = req.session.userId;

    try {
      await Project.findOneOrFail({
        where: { id: projectId, ownerId: userId },
      });

      const lists = await List.find({
        where: { projectId: projectId },
        relations: ["issues"],
        order: { order: "ASC" },
      });

      return lists;
    } catch (error) {
      console.log("error: ", error);
      return [];
    }
  }

  @Query(() => List, { nullable: true })
  list(@Arg("listId", () => Int) listId: number): Promise<List | undefined> {
    return List.findOne(listId, {
      relations: ["issues"],
      order: { order: "ASC" },
    });
  }

  @Mutation(() => List)
  @UseMiddleware(isAuth)
  async createList(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("name") name: string
  ): Promise<List | undefined> {
    try {
      const project = await Project.findOneOrFail(projectId);

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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateListOrder(
    @Arg("options", () => UpdateListsOrderInput)
    { id, order }: UpdateListsOrderInput,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const userId = req.session.userId;

    try {
      const list = await List.findOneOrFail(id);
      console.log("🚀 ~ list", list);
      if (!list) throw new Error("obtaining the list with the provided id");

      const project = await Project.findOneOrFail({
        where: { id: list.projectId, ownerId: userId },
      });
      console.log("🚀 ~ project", project);
      if (!project)
        throw new Error("checking if user has permissions on the project");

      const lists = await List.find({
        where: { projectId: project.id },
      });
      if (!lists || lists.length === 0)
        throw new Error("getting all the lists of the project");

      const newListsOrder = updateOrder(lists, {
        id,
        order,
      });
      if (!newListsOrder) throw new Error("when reordering the lists");

      await List.save(newListsOrder);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
