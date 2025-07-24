import { userRouter } from "./userRoutes";
import { blogRouter } from "./blogRoutes";
import { commentRouter } from "./commentRoutes";

import { Router } from "express";

const routers = Router();
const allRoutes = [userRouter, blogRouter, commentRouter];
routers.use('/api/v2', ...allRoutes);
export { routers };