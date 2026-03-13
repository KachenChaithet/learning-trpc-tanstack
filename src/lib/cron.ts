import cron from "node-cron";

export const startCronJobs = () => {
  // ยิงทุกวัน 08:00
  cron.schedule("0 8 * * *", async () => {
    console.log("🔔 Running due date notification cron...");

    await fetch("http://localhost:3000/api/cron/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });
  });
};