import { RequestHandler } from "express";
import { body, ValidationChain, validationResult, ValidationError } from "express-validator";
import { UserAuthInterface } from "../Interface/UserAuthInterface";
import { UserAuth } from "../models/UserAuthModel";
import { ResponseData } from "../utils/Response";
import { EMAIL_REGEX } from "../utils/Constant";

interface ValidationErrors {
  [key: string]: string;
}

export class ValidatorRegistration {
  static rulesCreate: ValidationChain[] = [
    body("username")
      .notEmpty()
      .withMessage("Username can't be empty")
      .custom(async (value) => {
        const response: UserAuthInterface | null = await UserAuth.findOne({ username: value });
        if (response) return Promise.reject("Username already registered");
      }),
    body("email")
      .notEmpty()
      .withMessage("Email can't be empty")
      .custom(async (value) => {
        if (!EMAIL_REGEX.test(value)) return Promise.reject("Email is not in the correct format");
        const response: UserAuthInterface | null = await UserAuth.findOne({ email: value });
        if (response) return Promise.reject("Email already registered");
      }),
    body("password").notEmpty().withMessage("Password can't be empty"),
  ];

  static create: RequestHandler = (req, res, next) => {
    Promise.all(this.rulesCreate.map((validator) => validator.run(req)))
      .then(async () => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          next();
        } else {
          const extractedErrors: ValidationErrors = {};
          errors.array().forEach((err: any) => {
            // Use 'any' to bypass TypeScript errors
            extractedErrors[`${err.path}`] = err.msg;
          });

          // return res.status(422).json({ errors: extractedErrors });
          return res
            .status(422)
            .send(await ResponseData.errors(false, 422, "error", extractedErrors));
        }
      })
      .catch(async (err) => {
        // return res.status(500).json({ error: 'An unexpected error occurred' });
        return res.status(422).send(await ResponseData.errors(false, 422, "error"));
      });
  };
}
