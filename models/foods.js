const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model("foods", {
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timestamp: {
    type: Date,
  },
  userid: {
    type: ObjectId,
  },
});
