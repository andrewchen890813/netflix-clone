import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prismadb from "@/lib/prismadb";
import { compare } from "bcrypt";

export default NextAuth({
  providers: [
    // 使用帳號及密碼登入
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      //   驗證
      async authorize(credentials) {
        // 是否填入Email及Password
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and Password required");
        }
        // 找到填入Email使用者
        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        // 找不到使用者或是沒有密碼
        if (!user || !user.hashedPassword) {
          throw new Error("Email does not exist");
        }
        // 比對密碼是否正確
        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword
        );
        // 不正確的話
        if (!isCorrectPassword) {
          throw new Error("Incorrect password");
        }
        // 沒問題的話回傳user
        return user;
      },
    }),
  ],
  //   登入失敗跳頁
  pages: {
    signIn: "/auth",
  },
  // dev 模式會看到更多錯誤訊息
  debug: process.env.NODE_ENV === "development",
  // 使用 jwt 儲存 session
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
