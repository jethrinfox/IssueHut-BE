import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Project } from "./Project"

@ObjectType()
@Entity("activities")
export class Activity extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  text: string

  @ManyToOne(() => Project, (project) => project.activities)
  project: Project

  // @Field()
  // @Column()
  // order: string

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date
}
