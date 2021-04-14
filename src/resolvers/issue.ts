import {
  Arg,
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

@Resolver(Issue)
export class IssueResolver {
  @Query(() => [Issue])
  issues(): Promise<Issue[]> {
    return Issue.find();
  }

  @Query(() => Issue, { nullable: true })
  issue(
    @Arg("issueId", () => Int) issueId: number
  ): Promise<Issue | undefined> {
    return Issue.findOne(issueId);
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
}
