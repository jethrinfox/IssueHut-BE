import { Field, ObjectType } from "type-graphql"
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Project } from "./Project"
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
  description!: string

  @OneToOne(() => User)
  @JoinColumn()
  reporterId: User

  @OneToOne(() => User)
  @JoinColumn()
  assigneeId: User

  @ManyToOne(() => Project, (project) => project.id)
  projectId!: Project

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
