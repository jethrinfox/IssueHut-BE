import { Field, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import Model from "./Model";

@ObjectType()
@Entity("users")
export class User extends Model {
  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column({ nullable: true })
  displayName?: string;

  @Column()
  password: string;

  // @Field(() => [Project], { nullable: true })
  // @ManyToMany(() => Project)
  // member?: Project[];

  // @OneToMany(() => Project, (project) => project.owner)
  // projects: Project[];

  // @OneToMany(() => Issue, (issue) => issue.reporter)
  // issuesReported: Issue[];

  // @OneToMany(() => Issue, (issue) => issue.assignee)
  // issuesAssigned: Issue[];

  // @OneToMany(() => Comment, (comment) => comment.creator)
  // comments: Comment[];
}
