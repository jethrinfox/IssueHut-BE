import argon2 from "argon2"
import { MyContext } from "src/types"
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../config"
import { User } from "../entities/User"

@InputType()
class UsernamePasswordInput {
  @Field()
  email: string

  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email
    }
    return ""
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { email, username, password }: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    // TODO: validate user input

    // Hash password
    const hashedPassword = await argon2.hash(password)

    try {
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      }).save()

      req.session.userId = user.id

      return { user }
    } catch (error) {
      // duplicate username error
      if (error.code === "23505") {
        if (error.detail.includes("email")) {
          return {
            errors: [
              {
                field: "email",
                message: "email already exists",
              },
            ],
          }
        }
        if (error.detail.includes("username")) {
          return {
            errors: [
              {
                field: "username",
                message: "username already exists",
              },
            ],
          }
        }
      }
      return {
        errors: [
          {
            field: "username",
            message: "server error - try again later",
          },
        ],
      }
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    )

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username or email doesn't exist",
          },
        ],
      }
    }
    // verify user input with db hashed password
    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      }
    }

    req.session.userId = user.id

    return { user }
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null
    }
    return await User.findOne({ id: req.session.userId })
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        res.clearCookie(COOKIE_NAME)
        resolve(true)
      }),
    )
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext,
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password length must be greater than 2",
          },
        ],
      }
    }

    const key = FORGET_PASSWORD_PREFIX + token

    const userId = await redis.get(key)

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "expired token",
          },
        ],
      }
    }

    const id = parseInt(userId)

    const user = await User.findOne({ id })

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exist",
          },
        ],
      }
    }

    await User.update(id, { password: await argon2.hash(newPassword) })

    // Delete redis token after being used
    await redis.del(key)

    // Log in user
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string) {
    const user = await User.findOne({ email })
    if (!user) return true
    return true
  }

  @Mutation(() => Boolean)
  async deleteAllPost(): Promise<boolean> {
    await User.delete({})
    return true
  }
}
