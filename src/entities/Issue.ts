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
import { List } from "./List"
import { User } from "./User"

@ObjectType()
@Entity("issues")
export class Issue extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  name!: string

  @Field()
  @Column()
  description: string

  @ManyToOne(() => User, (user) => user.id)
  reporter!: User

  @ManyToOne(() => User, (user) => user.id)
  assignee: User

  @ManyToOne(() => List, (list) => list.id)
  list!: List

  @Field()
  @Column({ default: false })
  priority!: boolean

  @Field()
  @Column({ default: false })
  archived!: boolean

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
