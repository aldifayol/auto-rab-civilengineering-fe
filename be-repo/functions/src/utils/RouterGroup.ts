import express, { Router } from "express";

export class RouterGroup {
  static group(
    router: Router,
    path: string,
    callback: (router: Router) => void
  ) {
    const groupedRouter = express.Router();
    callback(groupedRouter);
    router.use(path, groupedRouter);
  }
}