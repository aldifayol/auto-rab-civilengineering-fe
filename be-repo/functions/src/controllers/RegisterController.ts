import { Request, Response } from "express";
import { UserAuthInterface } from "../Interface/UserAuthInterface";
import { UserAuth } from "../models/UserAuthModel";
import { Utils } from "../utils/Utils";
import { ResponseData } from "../utils/Response";
import { ResetPassword } from "../models/ResetPasswordModel";

export class RegisterController {
  // Get all users
  static async get(req: Request, res: Response): Promise<void | Response> {
    try {
      const { address, phone, email } = req.query;
      const { populate }: { populate: boolean } = req.body;
      let query = UserAuth.find().select("-password");

      // Apply population if the condition is met
      if (populate) {
        query = query.populate({
          path: "resets",
          populate: {
            path: "user_id",
            // model: 'user', // Specify model if necessary
            select: "username email", // Fields to include
            match: {
              is_active: true, // Filter condition
            },
          },
        });
      }

      // Execute the query and retrieve the results
      const user = await query.exec();

      res
        .status(201)
        .send(await ResponseData.success(true, 201, "Successfully get data", { user: user }));
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  // Get user by ID
  static getById = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const user = await UserAuth.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(await ResponseData.success(true, 201, "Successfully get data", { user: user }));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  };

  // Create user
  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, username, password, email, created_by }: UserAuthInterface = req.body;
      if (!password) {
        throw new Error("Password missing");
      }
      const hashedPassword: string = await Utils.hashPassword(password);
      const newUser: UserAuthInterface = new UserAuth({
        user_id: user_id,
        username,
        password: hashedPassword,
        email: email,
        // created_by: created_by,
        is_active: true,
      });
      await newUser.save();
      res
        .status(201)
        .json(
          await ResponseData.success(true, 201, "Successfully created data", { user: newUser })
        );
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };

  // Update user
  static update = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params;
      req.body["updated_by"] = req.user!.id;
      req.body["password"] = await Utils.hashPassword(req.body.password);
      const user = await UserAuth.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        upsert: false,
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(await ResponseData.success(true, 201, "Successfully updated data", { user: user }));
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  // Delete user
  static delete = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const user = await UserAuth.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User auth not found" });
      }
      await UserAuth.findByIdAndDelete(req.params.id);
      res
        .status(204)
        .send(await ResponseData.success(true, 204, "Successfully deleted data", { user: user }));
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user auth" });
    }
  };
}
