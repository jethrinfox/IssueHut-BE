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
  body!: string

  @ManyToOne(() => Issue, (issue) => issue.id)
  issueId!: Issue

  @ManyToOne(() => User, (user) => user.id)
  userId!: User

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
