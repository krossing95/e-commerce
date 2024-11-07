import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import cors from "cors"
import { createServer } from "http"
import userRouter from "./src/routes/router.user"
import productCategoryRouter from "./src/routes/router.product-category"

const app = express()
dotenv.config()
const PORT = process.env.PORT || process.env.ECOM_PORT
app.use(helmet())
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
)
app.use(express.json({ limit: "10mb" }))

app.get("/", (req, res) => {
  return res.send("Ecommerce System")
})

// Routers

app.use("/api/users", userRouter)
app.use("/api/product-categories", productCategoryRouter)

const server = createServer(app)
server.listen(PORT, () => console.log(`Service is running on port ${PORT}`))
