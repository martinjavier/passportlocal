import express from "express";
import path from "path";
import { engine } from "express-handlebars";
import session from "express-session";
import AuthRouter from "./routers/auth.router.js";
import passport from "./utils/passport.util.js";
import minimist from "minimist";
import { fork } from "child_process";

import "./config/db.js";

const random = fork("./src/randoms.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", "./src/views");
app.set("view engine", "hbs");
app.engine(
  "hbs",
  engine({
    extended: ".hbs",
    defaultLayout: "main.hbs",
    layoutsDir: path.resolve() + "/src/views/layouts",
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    cookie: {
      maxAge: Number(process.env.EXPIRE),
    },
    rolling: true,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/", AuthRouter);

app.get("/api/randoms", (req, res) => {
  random.on("message", (resultado) => {
    console.log("Resultado ", resultado);
    res.status(200).json({ resultado });
  });
  random.send("start");
});

app.get("/info", (req, res) => {
  const informacion = {
    // Argumentos de entrada
    argumentos: process.argv,
    // Nombre del SO
    sistema: process.platform,
    // Versión de NODE
    node: process.version,
    // Memoria total reservada RSS
    rss: process.memoryUsage().rss,
    // Path de ejecución
    path: process.execPath,
    // Process ID
    proceso: process.pid,
    // Carpeta del proyecto
  };
  res.status(200).json({ informacion });
});

const options = {
  default: {
    port: 8080,
  },
  alias: {
    p: "port",
  },
};

const { port } = minimist(process.argv.slice(2), options);

const PORT = { port };
const puerto = PORT.port;

const server = app.listen(puerto, () =>
  console.log(`🚀 Server started on port http://localhost:${puerto}`)
);
server.on("error", (err) => console.log(err));
