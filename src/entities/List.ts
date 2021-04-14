import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import Model from "./Model";
import { Project } from "./Project";

@ObjectType()
@Entity("lists")
export class List extends Model {
  @Field()
  @Column()
  name: string;

  // @Field()
  // @Column()
  // order: string

  @Field()
  @Column({ default: false })
  archived: boolean;

  @ManyToOne(() => Project, (project) => project.lists)
  project: Project;
}
