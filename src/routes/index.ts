import { userRouter } from "./userRoutes";
import { blogRouter } from "./blogRoutes";
import { commentRouter } from "./commentRoutes";
import { likeRouter } from "./likeRoutes";
import { subscriberRouter } from "./subscriberRoutes";

import { Router } from "express";

const routers = Router();
const allRoutes = [userRouter, blogRouter, commentRouter, likeRouter, subscriberRouter];
routers.use('/api/v2', ...allRoutes);
export { routers };