import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Activity } from "./Activity";
import { List } from "./List";
import Model from "./Model";
import { User } from "./User";

@ObjectType()
@Entity("projects")
export class Project extends Model {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description?: string;

  @Field()
  @Column()
  ownerId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  owner: User;

  // @Field()
  // @ManyToOne(() => User, (user) => user.member)
  // members?: User;

  @OneToMany(() => List, (list) => list.project)
  lists: List[];

  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];
}
