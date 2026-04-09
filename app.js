const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");





const { userRouter } = require("./src/routes/user.routes");
const { eventRouter } = require("./src/routes/event.routes");
const { galleryRouter } = require("./src/routes/gallery.routes");
const { donationRouter } = require("./src/routes/donation.routes");
const { festivalDonationRouter } = require("./src/routes/festivalDonation.routes");
const { paymentRouter } = require("./src/routes/payment.routes");
const { importantDateRouter } = require("./src/routes/importantDate.routes.js");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/payments", paymentRouter);

app.use(express.json());

app.use("/users", userRouter);
app.use("/events", eventRouter);
app.use("/gallery", galleryRouter);
app.use("/donations", donationRouter);

app.use("/important-dates", importantDateRouter);
app.use("/festival-donations", festivalDonationRouter);

module.exports = { app };