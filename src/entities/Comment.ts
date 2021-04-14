import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Issue } from "./Issue";
import Model from "./Model";
import { User } from "./User";

@ObjectType()
@Entity("comments")
export class Comment extends Model {
  @Field()
  @Column()
  text: string;

  @ManyToOne(() => Issue, (issue) => issue.comments)
  issue: Issue;

  @ManyToOne(() => User, (user) => user.comments)
  creator: User;
}
