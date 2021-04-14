import argon2 from "argon2";
import { IsEmail, Length } from "class-validator";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { COOKIE_NAME } from "../config";
import { User } from "../entities/User";

@InputType()
class UsernameInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(3, 30)
  username: string;

  @Field()
  @Length(3, 60)
  password: string;
}
@InputType()
class EmailInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(3, 60)
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") { email, username, password }: UsernameInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Hash password
    const hashedPassword = await argon2.hash(password);

    try {
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      }).save();

      req.session.userId = user.id;

      return { user };
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
          };
        }
        if (error.detail.includes("username")) {
          return {
            errors: [
              {
                field: "username",
                message: "username already exists",
              },
            ],
          };
        }
      }
      return {
        errors: [
          {
            field: "username",
            message: "server error - try again later",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") { email, password }: EmailInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "That email doesn't exist",
          },
        ],
      };
    }
    // verify user input with db hashed password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      })
    );
  }
}
