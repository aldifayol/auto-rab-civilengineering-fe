import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express'
import { Utils } from "../utils/Utils";
import { UserAuth } from '../models/UserAuthModel';
import { UserAuthInterface } from '../Interface/UserAuthInterface';
import { ResponseData } from '../utils/Response';
import { PayloadJwt, PayloadLogin } from '../Interface/PayloadInterface';
import { ResetPassword } from '../models/ResetPasswordModel';
import { ResetPasswordInterface } from '../Interface/ResetPasswordInterface';
import { StateResetPassword } from '../utils/Enum';
import { EXPIRED_JWT, EXPIRED_TOKEN_RESET_PASSWORD, LENGTH_TOKEN_RESET_PASSWORD } from '../utils/Constant';

dotenv.config();

interface RequestState extends Request {
    state?: StateResetPassword
}

export class AuthController {
    static async login(req: Request, res: Response): Promise<void | Response> {
        try {
            const { username, email, password } = req.body
            const methodLogin = username ? { username: username } : { email: email }
            const response: UserAuthInterface | null | undefined = await UserAuth.findOne(methodLogin)
            if (!response) return res.sendStatus(404)
            const isMatch: boolean = await Utils.comparePassword(password, response.password!)
            if (!isMatch) return res.sendStatus(401)

            const updateParams: { last_login: string, updated_by: string } = {
                last_login: await Utils.getFormattedTimezone(),
                updated_by: response._id as string
            }

            const update: UserAuthInterface | null = await UserAuth.findOneAndUpdate({ _id: response._id }, updateParams, { new: true, upsert: false })

            if (!update) throw new Error("Internal server error")

            const payload: PayloadJwt = {
                id: update._id as string,
                username: update.username,
                email: update.email,
                last_login: update.last_login!,
                is_login: update.is_login!,
                is_active: update.is_active
            }
            // Generate Jwt
            const token: string = jwt.sign(payload, process.env.SECRET_KEY!, {
                expiresIn: `${EXPIRED_JWT}`
            })
            const data: PayloadLogin = {
                user: payload,
                token: token
            }
            return res.status(200).json({ status: true, message: 'Logged In', data: data })
        } catch (error) {
            console.log(error)
            return res.status(500).send(await ResponseData.errors(false, 500, 'Internal server error!'))
        }
    }

    static async logout(req: Request, res: Response) { }

    static async me(req: Request, res: Response) {
        try {
            res.status(200).send(await ResponseData.success(true, 200, 'Successfully get data', req.user))
        } catch (error) {
            console.log(error)
            return res.status(500).send(await ResponseData.errors(false, 500, 'Internal server error!'))
        }
    }

    static async sendTokenToEmail(req: RequestState, res: Response): Promise<void | Response | Boolean> {
        try {
            const { email }: { email: string } = req.body
            const response = await AuthController.sendToken(email)
            if (response === null) return res.status(404).send(await ResponseData.errors(false, 404, 'Email not found'))
            if (response === false) return res.status(404).send(await ResponseData.errors(false, 404, 'You already sent request reset password'))
            if (response === undefined) return res.status(404).send(await ResponseData.errors(false, 404, 'Error sending email'))
            return res.status(200).send(await ResponseData.success(false, 200, 'Successfully send reset password'))
        } catch (error) {
            console.log(error)
            return res.status(500).send(await ResponseData.errors(false, 500, 'Internal server error!'))
        }
    }

    static async sendToken(email: string): Promise<Boolean | undefined | null> {
        try {
            const currentTime: Date = new Date();
            const oneHourLater: Date = new Date(currentTime.getTime() + EXPIRED_TOKEN_RESET_PASSWORD * 60 * 1000);
            const response: UserAuthInterface | null = await UserAuth.findOne({ email: email })
            if (!response) return null
            const isReset: ResetPasswordInterface[] | null = await ResetPassword.find({ user_id: response.id, is_reset: false })
            if (isReset.length > 0) return false
            const name: string = response.username
            const generatedToken: string = await Utils.generateRandomString(LENGTH_TOKEN_RESET_PASSWORD)
            const code: string = generatedToken
            const html: Object = await Utils.renderEmailTemplate('ResetPassword', { name, code });
            // Define email options
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Reset Password',
                html, // Set the rendered HTML as the email content
            };
            try {
                await Utils.sendEmail(mailOptions)
            } catch (error) {
                return undefined
            }
            const newList: ResetPasswordInterface = new ResetPassword({
                user_id: response.id,
                token: generatedToken,
                until_at: oneHourLater,
                is_reset: false,
                is_expired: false,
            });
            await newList.save()
            return true
        } catch (error) {
            console.log(error)
            // return res.status(500).send(await ResponseData.errors(false, 500, 'Internal server error!'))
            // return error
        }
    }

    static async validateToken(req: Request, res: Response): Promise<Response | void> {
        try {
            const token: string = req.params.token
            const response: ResetPasswordInterface | null = await ResetPassword.findOne({ token: token })
            if (!response) return res.status(401).send(await ResponseData.errors(false, 401, 'Token not found'))
            if (!await Utils.expires(new Date(response.until_at))) return res.status(410).send(await ResponseData.errors(false, 410, 'Token expires and not available!'))
            return res.status(200).send(await ResponseData.success(true, 200, 'Successfully validated token', { token: token }))
        } catch (error) {
            console.log(error)
            return res.status(500).send(await ResponseData.errors(false, 500, 'Internal server error!'))
        }
    }

    static async resetPasswordByToken(req: Request, res: Response): Promise<Response | void> {
        try {

            const { token, password }: { token: string, password: string } = req.body

            const isTokenExist: ResetPasswordInterface | null = await ResetPassword.findOne({ token: token })

            if (!isTokenExist) return res.status(401).send(await ResponseData.errors(false, 402, 'Unauthorized process!'))

            if (isTokenExist.is_reset) return res.status(406).send(await ResponseData.errors(false, 406, 'Not acceptable!'))

            if (!await Utils.expires(new Date(isTokenExist.until_at))) {
                await ResetPassword.findOneAndUpdate({ _id: isTokenExist.id }, { is_expired: true }, { new: true, upsert: false })
                return res.status(410).send(await ResponseData.errors(false, 410, 'Token expires and not available!'))
            }

            const resetData = { is_reset: true }

            const resetResponse: ResetPasswordInterface | null = await ResetPassword.findOneAndUpdate({ user_id: isTokenExist.user_id }, resetData, { new: true, upsert: false })
            if (!resetResponse) return res.status(404).json(await ResponseData.errors(false, 404, 'Token not found!'));

            const userData = { password: await Utils.hashPassword(password) }

            const userResponse: UserAuthInterface | null = await UserAuth.findOneAndUpdate({ _id: isTokenExist.user_id }, userData, { new: true, upsert: false })
            if (!userResponse) return res.status(404).json(await ResponseData.errors(false, 404, 'Reset password can\'t be updated!'));

            return res.status(201).send(await ResponseData.success(true, 201, 'Successfully updated password'));
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal server error'); // Ensure you handle errors properly
        }
    }
}
