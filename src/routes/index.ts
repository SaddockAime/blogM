import { userRouter } from "./userRoutes";
import { blogRouter } from "./blogRoutes";
import { commentRouter } from "./commentRoutes";
import { likeRouter } from "./likeRoutes";

import { Router } from "express";

const routers = Router();
const allRoutes = [userRouter, blogRouter, commentRouter, likeRouter];
routers.use('/api/v2', ...allRoutes);
export { routers };