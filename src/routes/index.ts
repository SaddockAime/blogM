import { userRouter } from "./userRoutes";
import { blogRouter } from "./blogRoutes";

import { Router } from "express";

const routers = Router();
const allRoutes = [userRouter, blogRouter];
routers.use('/api/v2', ...allRoutes);
export { routers };