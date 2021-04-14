import { Arg, Int, Query, Resolver } from "type-graphql";
import { Issue } from "../entities/Issue";

@Resolver(Issue)
export class IssueResolver {
  @Query(() => [Issue])
  async issues(): Promise<Issue[]> {
    const Issues = await Issue.find();

    return Issues;
  }

  @Query(() => Issue, { nullable: true })
  async issue(@Arg("id", () => Int) id: number): Promise<Issue | undefined> {
    return await Issue.findOne(id);
  }
}
