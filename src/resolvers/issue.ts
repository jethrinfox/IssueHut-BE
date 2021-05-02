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
import { Issue } from "../entities/Issue";
import { List } from "../entities/List";
import { isAuth } from "../middleware/isAuth";
import { IssuePriority } from "../entities/Issue";
import { MyContext } from "../types";
import { updateOrder } from "../utils/draggableUtils";
import { Project } from "../entities/Project";

@InputType()
class IssueInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  priority?: IssuePriority;

  @Field({ nullable: true })
  archived: boolean;
}

@InputType()
class UpdateIssueOrderInput {
  @Field()
  id: number;

  @Field()
  order: number;
}

@Resolver(Issue)
export class IssueResolver {
  @Query(() => [Issue])
  issues(@Arg("listId", () => Int) listId: number): Promise<Issue[]> {
    return Issue.find({
      where: { listId },
      relations: ["comments"],
      order: { order: "ASC" },
    });
  }

  @Query(() => Issue, { nullable: true })
  issue(
    @Arg("issueId", () => Int) issueId: number,
    @Ctx() { req }: MyContext
  ): Promise<Issue | undefined> {
    const userId = req.session.userId;

    return Issue.findOne({
      where: [{ id: issueId }, { reporter: userId }],
      relations: ["comments", "reporter"],
    });
  }

  @Mutation(() => Issue)
  @UseMiddleware(isAuth)
  async createIssue(
    @Arg("listId", () => Int) listId: number,
    @Arg("options") options: IssueInput
  ): Promise<Issue | undefined> {
    let list;

    try {
      list = await List.findOneOrFail(listId);

      return Issue.create({ ...options, list }).save();
    } catch (error) {
      console.log("error: ", error);
      return;
    }
  }

  @Mutation(() => Issue)
  @UseMiddleware(isAuth)
  async updateIssue(
    @Arg("issueId", () => Int) issueId: number,
    @Arg("options") options: IssueInput
  ): Promise<Issue | undefined> {
    let issue;
    try {
      await Issue.findOneOrFail(issueId);
      issue = (await Issue.update(issueId, { ...options })).raw;
    } catch (error) {
      console.log("error: ", error);
      return;
    }

    return issue;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteIssue(
    @Arg("issueId", () => Int) issueId: number
  ): Promise<boolean> {
    return Boolean((await Issue.delete(issueId)).affected);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateIssueOrder(
    @Arg("options", () => UpdateIssueOrderInput)
    { id, order }: UpdateIssueOrderInput,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const userId = req.session.userId;

    try {
      const issue = await Issue.findOneOrFail(id);
      const list = await List.findOneOrFail({
        where: { id: issue.listId },
      });
      await Project.findOneOrFail({
        where: [{ id: list.project }, { ownerId: userId }],
      });
      const issues = await Issue.find({
        where: { listId: list.id },
      });

      const newIssuesOrder = updateOrder(issues, {
        id,
        order,
      });

      if (!newIssuesOrder) throw new Error("New order validation error");

      await Issue.save(newIssuesOrder);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
