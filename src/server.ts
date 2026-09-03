import app from "./app";
import config from "./app/config";

async function main() {
  try {
    const server = app.listen(config.port, () => {
      console.log(
        `City Waste Management Server is running on port ${config.port}`
      );
    });

    process.on("unhandledRejection", (err) => {
      console.log(`unhandledRejection is detected, shutting down...`);
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    process.on("uncaughtException", () => {
      console.log(`uncaughtException is detected, shutting down...`);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server", err);
  }
}

main();
