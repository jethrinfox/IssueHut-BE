import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Comment } from "./Comment";
import { List } from "./List";
import Model from "./Model";
import { User } from "./User";

enum IssuePriority {
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
  @Column()
  description: string;

  @Field()
  @Column({ type: "enum", enum: IssuePriority, default: IssuePriority.MEDIUM })
  priority: IssuePriority;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @ManyToOne(() => User, (user) => user.issuesReported)
  reporter: User;

  @ManyToOne(() => User, (user) => user.issuesAssigned)
  assignee: User;

  @ManyToOne(() => List, (list) => list.id)
  list: List;

  @OneToMany(() => Comment, (comment) => comment.issue)
  comments: Comment[];
}
