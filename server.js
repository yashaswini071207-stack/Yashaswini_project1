import exp from "express";
import { connect } from "mongoose";
import { userRouter } from "./api/userAPI.js";
import { jobRouter } from "./api/jobAPI.js";
import { applicationRouter } from "./api/applicationAPI.js";
import { adminRouter } from "./api/adminAPI.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";



config(); // process.env

const app = exp();
app.use(cookieParser());
app.use(exp.json());

app.use("/user-api", userRouter);
app.use("/job-api", jobRouter);
app.use("/application-api", applicationRouter);
app.use("/admin-api", adminRouter);

const port = process.env.PORT;

async function connectDB() {
  try {
    await connect(process.env.DB_URL);
    console.log("DB Connected");

    app.listen(port, () => {
      console.log(`server listening on ${port}..`);
    });
  } catch (err) {
    console.log("err in db connect :", err);
  }
}

connectDB();

app.use((err, req, res, next) => {
  console.log("err is", err);

  res.json({
    success: false,
    message: err.message
  });
});