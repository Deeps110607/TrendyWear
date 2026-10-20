require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function createAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const admins = [
      {
        name: "Administrator",
        email: "lovelyvaitheepv@trendywear.com",
        password: "rosi2007",
        phone: "8015567343",
      },
      {
        name: "Co-Administrator-1",
        email: "arunjeyapal011@trendywear.com",
        password: "8508858306",
        phone: "8508858306",
      },
      {
        name: "Co-Administrator-2",
        email: "sreevenkateshv@trendywear.com",
        password: "sreeshiva28",
        phone: "9025488343",
      },
    ];

    for (const admin of admins) {
      const existing = await User.findOne({ email: admin.email });

      if (existing) {
        console.log(`⚠️ ${admin.email} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      const newAdmin = new User({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        phone: admin.phone,
        role: "admin",
      });

      await newAdmin.save();

      console.log(`✅ Created: ${admin.email}`);
    }

    console.log("🎉 Admin creation process completed.");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdmins();