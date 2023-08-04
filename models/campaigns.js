const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model("foods", {
  title: {
    type: String,
    required: true,
  },
  subjects: {
    type: ObjectId,
    required: true,
  },
  messages: {
    type: ObjectId,
    required: true,
  },
  recipients: {
    type: ObjectId,
    required: true,
  },
});
