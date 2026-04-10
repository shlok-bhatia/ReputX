import Milestone from "../models/Milestone.model.js";

// GET /api/milestones/:address
export async function getMilestones(req, res, next) {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const milestones = await Milestone.find({ address: address.toLowerCase() }).sort({ timestamp: -1 });
    return res.json(milestones);
  } catch (err) {
    next(err);
  }
}

// POST /api/milestones
export async function createMilestone(req, res, next) {
  try {
    const { address, date, title, desc, dot, timestamp } = req.body;

    if (!address || !title || !desc || !date) {
      return res.status(400).json({ error: "Missing required fields: address, date, title, desc" });
    }

    const milestone = new Milestone({
      address: address.toLowerCase(),
      date,
      title,
      desc,
      dot: dot || "gray",
      timestamp: timestamp ? new Date(timestamp) : Date.now(),
    });

    await milestone.save();
    return res.status(201).json(milestone);
  } catch (err) {
    next(err);
  }
}
