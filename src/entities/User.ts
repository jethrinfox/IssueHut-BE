import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { Comment } from "./Comment";
import { Issue } from "./Issue";
import Model from "./Model";
import { Project } from "./Project";

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

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  // @OneToMany(() => Project, (project) => project.members)
  // member: Project[];

  @OneToMany(() => Issue, (issue) => issue.reporter)
  issuesReported: Issue[];

  @OneToMany(() => Issue, (issue) => issue.assignee)
  issuesAssigned: Issue[];

  @OneToMany(() => Comment, (comment) => comment.creator)
  comments: Comment[];
}
