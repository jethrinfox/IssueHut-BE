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

  @Field()
  @Column({ type: "int", nullable: true })
  order: number;

  @Field()
  @Column()
  listId: number;

  @ManyToOne(() => List, (list) => list.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  list: List;

  @Field()
  @Column()
  reporterId: number;

  @Field()
  @ManyToOne(() => User)
  reporter: User;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.issue)
  comments: Comment[];
}
