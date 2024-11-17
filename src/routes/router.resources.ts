import express from "express"
import FetchRegions from "../controllers/resources/resources.regions"
import FetchBanks from "../controllers/resources/resources.banks"

const resourcesRouter = express.Router()

resourcesRouter.get("/regions", FetchRegions)

resourcesRouter.get("/banks", FetchBanks)

export default resourcesRouter
