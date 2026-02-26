import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import {
  signUpController,
  loginController,
  logoutController,
  isAuthenticated,
} from "./controllers/auth.controller.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isAuth = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  return res.redirect("/login");
};

//<------------added for deployment safety-------->
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}
//<---------------------------------------------------->
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "sahil",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.MONGODB_URI ||
      "mongodb+srv://rajpootsahil51_db_user:YOUR_PASSWORD@cluster0.wftt93m.mongodb.net/",
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(sessionMiddleware);

const server = http.createServer(app);
const io = new Server(server);
io.engine.use(sessionMiddleware);

//<-----pages---->
app.get("/login", (req, res) => {
  res.render("login", { user: req.session.user });
});
app.get("/signup", (req, res) => {
  res.render("signup", { user: req.session.user });
});

app.get("/", isAuth, (req, res) => {
  res.render("index", { user: req.session.user });
});

//<-----api---->
app.post("/api/signup", signUpController);
app.post("/api/login", loginController);
app.post("/api/logout", logoutController);

//<-----checking auth--only for me----->
app.get("/api/admin/auth/status", isAuthenticated);

//<------websocket for leaflet------>
io.on("connection", (socket) => {
  //console.log("A user connected with id:", socket.id);
  const user = socket.request.session.user ||{};
  socket.on("send-location", (data) => {
    io.emit("recieved-loc", { id: socket.id, ...data, ...user });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected with id:", socket.id);
    io.emit("user-disconnected", { id: socket.id });
  });
});

app.get("/api/health-checker", (req, res) => {
  res.status(200).json({
    message: "Api is working",
  });
});

const PORT = process.env.PORT || 3000;
// app.listen(PORT,()=>{
//     console.log(`Server running at http://localhost:${PORT}`);

// })

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
