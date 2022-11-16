"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const body_parser_1 = __importDefault(require("body-parser"));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "1mb" }));
app.use(body_parser_1.default.json());
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.DATABASA_URL); // { useNewUrlParser: true });
const db = mongoose_1.default.connection;
db.on("error", (error) => {
    console.error(error);
});
db.once("open", () => {
    console.log("connected to mongo DB");
});
app.use(express_1.default.static("public")); //מאפשר גישה לכל מה שנמצא בתקיית public
const post_route_1 = __importDefault(require("./routes/post_route"));
app.use("/post", post_route_1.default);
module.exports = app;
//# sourceMappingURL=server.js.map