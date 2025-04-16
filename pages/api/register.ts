import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // 如果不是 POST 請求，回傳 405 Method Not Allowed
  }
  try {
    const { email, name, password } = req.body;

    // 檢查使用者是否已經註冊
    const existingUser = await prismadb.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(422).json({ error: "Email taken" }); // 如果 email 已被註冊，回傳 422
    }

    // 將密碼進行雜湊處理
    const hashedPassword = await bcrypt.hash(password, 12);

    // 建立新的使用者
    const user = await prismadb.user.create({
      data: {
        email,
        name,
        hashedPassword,
        image: "", // 預設圖片空
        emailVerified: new Date(), // 設定 email 驗證時間
      },
    });

    // 回傳成功的使用者資料
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "註冊失敗" }); // 發生錯誤時回傳 400 錯誤
  }
}
