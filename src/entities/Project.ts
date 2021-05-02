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
  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  owner: User;

  // @Field(() => [User], { nullable: true })
  // @ManyToMany(() => User)
  // @JoinTable()
  // members: User[];

  @OneToMany(() => List, (list) => list.project)
  lists: List[];

  @OneToMany(() => Activity, (activity) => activity.project)
  activities: Activity[];
}
