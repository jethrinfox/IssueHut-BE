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
      Project.findOneOrFail({
        where: { id: projectId, ownerId: userId },
      });

      return List.find({
        where: { project: projectId },
        relations: ["issues"],
        order: { order: "ASC" },
      });
    } catch (error) {
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
      const project = await Project.findOneOrFail({
        where: [{ id: list.project }, { ownerId: userId }],
      });
      const lists = await List.find({
        where: { project: project.id },
      });

      const newListsOrder = updateOrder(lists, {
        id,
        order,
      });

      if (!newListsOrder) throw new Error("New order validation error");

      await List.save(newListsOrder);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
