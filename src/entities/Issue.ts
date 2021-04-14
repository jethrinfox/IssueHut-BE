import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Comment } from "./Comment";
import { List } from "./List";
import Model from "./Model";
import { User } from "./User";

export enum IssuePriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

@ObjectType()
@Entity("issues")
export class Issue extends Model {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ type: "enum", enum: IssuePriority, default: IssuePriority.MEDIUM })
  priority: IssuePriority;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @ManyToOne(() => List, (list) => list.id, { nullable: false })
  list: List;

  @ManyToOne(() => User, (user) => user.issuesReported)
  reporter: User;

  @ManyToOne(() => User, (user) => user.issuesAssigned)
  assignee: User;

  @OneToMany(() => Comment, (comment) => comment.issue)
  comments: Comment[];
}
