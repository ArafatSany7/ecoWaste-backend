import bcrypt from "bcrypt";
import config from "../src/app/config";
import prisma from "../src/app/lib/prisma";

async function main() {
  console.log("Seeding started...");

  const adminEmail = "admin@ecowaste.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
