import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Issue } from "./Issue"
import { User } from "./User"

@ObjectType()
@Entity("comments")
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  text!: string

  @ManyToOne(() => Issue, (issue) => issue.id)
  issue!: Issue

  @ManyToOne(() => User, (user) => user.id)
  user!: User

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
