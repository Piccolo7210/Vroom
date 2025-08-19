import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  photo_link: {
    type: String,
  },
  sex: {
    type: String,
    required: true,
    enum: ['Female', 'male', 'others'],
  },
  present_address: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  payment_methods: {
    type: [String],
    enum: ['cash', 'bkash', 'card'],
    default: ['cash'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one payment method must be selected'
    }
  }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;