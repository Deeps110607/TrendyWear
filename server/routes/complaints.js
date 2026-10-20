const router = require("express").Router();
const mongoose = require("mongoose");

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model(
    "Complaint",
    new mongoose.Schema(
      {
        userId: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        email: {
          type: String,
          required: true,
        },

        subject: {
          type: String,
          required: true,
        },

        category: {
          type: String,
          required: true,
        },

        message: {
          type: String,
          required: true,
        },

        status: {
          type: String,
          enum: ["pending", "in-progress", "resolved"],
          default: "pending",
        },

        adminReply: {
          type: String,
          default: "",
        },

        repliedAt: {
          type: Date,
          default: null,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
      {
        timestamps: true,
      }
    )
  );


// ==========================================
// CUSTOMER SUBMITS COMPLAINT
// ==========================================

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      subject,
      category,
      message,
    } = req.body;

    if (
      !userId ||
      !name ||
      !email ||
      !subject ||
      !category ||
      !message
    ) {
      return res.status(400).json({
        message: "Please fill all complaint fields.",
      });
    }

    const complaint = new Complaint({
      userId,
      name,
      email,
      subject,
      category,
      message,
      status: "pending",
      adminReply: "",
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint,
    });

  } catch (error) {
    console.error("Complaint submission error:", error);

    res.status(500).json({
      message: "Failed to submit complaint.",
      error: error.message,
    });
  }
});


// ==========================================
// ADMIN GETS ALL COMPLAINTS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);

  } catch (error) {
    console.error("Get complaints error:", error);

    res.status(500).json({
      message: "Failed to fetch complaints.",
      error: error.message,
    });
  }
});


// ==========================================
// CUSTOMER GETS THEIR COMPLAINTS
// ==========================================

router.get("/:userId", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.params.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(complaints);

  } catch (error) {
    console.error("Get user complaints error:", error);

    res.status(500).json({
      message: "Failed to fetch complaints.",
      error: error.message,
    });
  }
});


// ==========================================
// ADMIN SENDS REPLY
// ==========================================

router.put("/:id/reply", async (req, res) => {
  try {
    const { adminReply } = req.body;

    console.log("Reply request received");
    console.log("Complaint ID:", req.params.id);
    console.log("Reply:", adminReply);

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({
        message: "Reply cannot be empty.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid complaint ID.",
      });
    }

    const complaint = await Complaint.findById(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    // IMPORTANT:
    // Use findByIdAndUpdate instead of complaint.save().
    // This allows older complaints that don't have userId
    // to receive an admin reply.

    const updatedComplaint =
      await Complaint.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            adminReply: adminReply.trim(),
            status: "resolved",
            repliedAt: new Date(),
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    console.log("Reply saved successfully");

    res.status(200).json({
      message: "Reply sent successfully!",
      complaint: updatedComplaint,
    });

  } catch (error) {
    console.error("Reply error:", error);

    res.status(500).json({
      message: "Failed to send reply.",
      error: error.message,
    });
  }
});


// ==========================================
// ADMIN CHANGES STATUS
// ==========================================

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    console.log("Status update request");
    console.log("Complaint ID:", req.params.id);
    console.log("Status:", status);

    if (
      !["pending", "in-progress", "resolved"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message: "Invalid complaint status.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid complaint ID.",
      });
    }

    const complaint =
      await Complaint.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: status,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    res.status(200).json({
      message: "Complaint status updated successfully.",
      complaint,
    });

  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Failed to update complaint status.",
      error: error.message,
    });
  }
});


module.exports = router;