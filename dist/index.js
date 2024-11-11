"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const router_user_1 = __importDefault(require("./src/routes/router.user"));
const router_product_category_1 = __importDefault(require("./src/routes/router.product-category"));
const router_resources_1 = __importDefault(require("./src/routes/router.resources"));
const routes_product_1 = __importDefault(require("./src/routes/routes.product"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const PORT = process.env.PORT || process.env.ECOM_PORT;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.get("/", (req, res) => {
    return res.send("Ecommerce System");
});
// Routers
app.use("/api/users", router_user_1.default);
app.use("/api/product-categories", router_product_category_1.default);
app.use("/api/resources", router_resources_1.default);
app.use("/api/products", routes_product_1.default);
const server = (0, http_1.createServer)(app);
server.listen(PORT, () => console.log(`Service is running on port ${PORT}`));
