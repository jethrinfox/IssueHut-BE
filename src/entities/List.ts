import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Issue } from "./Issue";
import Model from "./Model";
import { Project } from "./Project";

@ObjectType()
@Entity("lists")
export class List extends Model {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: "int" })
  order: number;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @Field(() => [Issue])
  @OneToMany(() => Issue, (issue) => issue.list)
  issues: Issue[];

  @Field()
  @Column()
  projectId: number;
  @ManyToOne(() => Project, (project) => project.lists, { onDelete: "CASCADE" })
  project: Project;
}
