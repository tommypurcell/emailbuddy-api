const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model("campaigns", {
  title: {
    type: String,
  },
  subjects: [{ type: String }],
  messages: [{ type: String }],
  recipients: [
    {
      name: { type: String },
      email: { type: String },
    },
  ],
});
