import dotenv from "dotenv";
import mongoose from "mongoose";
import Milestone from "./models/Milestone.model.js";

dotenv.config();

const addresses = [
  "0xbff0dcacfeac4ccc1adadc6085a9669f67de621d",
  "0xaad78098ecf2b9bed6bbb4d7ad2f0ded62655669",
  "0x8a09c813385a727a7b6244793760c7f77ed19a17"
];

const seedMilestones = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Connected to MongoDB for seeding Milestones...");

    // Clear any existing milestones for these addresses to avoid duplicates
    await Milestone.deleteMany({ address: { $in: addresses } });
    console.log("Cleared existing milestones for specified addresses.");

    const milestones = [];

    for (const address of addresses) {
      milestones.push(
        {
          address,
          date: 'March 2024',
          title: 'Tier "Trusted" Achieved',
          desc: 'Crossed 700 Reputation threshold.',
          dot: 'cyan',
          timestamp: new Date("2024-03-15T00:00:00Z")
        },
        {
          address,
          date: 'January 2024',
          title: '1,000 Transactions Milestone',
          desc: 'Processed on Ethereum Mainnet.',
          dot: 'purple',
          timestamp: new Date("2024-01-10T00:00:00Z")
        },
        {
          address,
          date: 'Late 2023',
          title: 'Genesis Contribution',
          desc: 'First DAO governance participation.',
          dot: 'gray',
          timestamp: new Date("2023-11-20T00:00:00Z")
        }
      );
    }

    await Milestone.insertMany(milestones);
    console.log(`Successfully seeded ${milestones.length} milestones for ${addresses.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedMilestones();
