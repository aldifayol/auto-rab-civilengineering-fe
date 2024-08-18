import express, { Router } from "express";
import { RegisterController } from "../controllers/RegisterController";
import { RouterGroup } from "../utils/RouterGroup";
import { AuthController } from "../controllers/AuthController";
import { Secure } from "../middleware/Secure";
import { ValidatorRegistration } from "../validation/ValidatorRegistration";

const router: Router = express.Router();

RouterGroup.group(router, "/auth", (Auth: Router) => {
    Auth.post("/login", AuthController.login)
    Auth.post("/logout", Secure.authenticateToken, () => { })
    Auth.get("/me", Secure.authenticateToken, AuthController.me)
})

RouterGroup.group(router, "/reset-password", (Reset: Router) => {
    Reset.post("/send-token-to-email", Secure.authenticateToken, AuthController.sendTokenToEmail)
    Reset.get("/validate-token/:token", Secure.authenticateToken, AuthController.validateToken)
    Reset.post("/token", Secure.authenticateToken, AuthController.resetPasswordByToken)
})

RouterGroup.group(router, "/register", (User: Router) => {
    User.get("/", Secure.authenticateToken, RegisterController.get);
    User.get("/:id", RegisterController.getById);
    User.post("/", ValidatorRegistration.create, RegisterController.create);
    User.put("/:id", Secure.authenticateToken, RegisterController.update);
    User.delete("/:id", Secure.authenticateToken, RegisterController.delete);
})


export default router;
