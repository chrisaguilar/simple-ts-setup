import { join } from "path";

import ejs from "ejs";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";

const app: Application = express();

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", join(__dirname, "public/views"));

app.use(morgan("dev"));

app.use("/public", express.static(join(__dirname, "public")));

app.get("*", (req: Request, res: Response) => {
    res.render("index");
});

// tslint:disable-next-line:no-console
app.listen(8080, () => console.log("Listening on port 8080"));
