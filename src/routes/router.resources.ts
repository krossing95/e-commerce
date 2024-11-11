import express from "express"
import FetchRegions from "../controllers/resources/resources.regions"

const resourcesRouter = express.Router()

resourcesRouter.get("/regions", FetchRegions)

export default resourcesRouter
