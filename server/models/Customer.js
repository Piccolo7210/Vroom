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
        enum : ['Female', 'male', 'others'],
    },
    present_address: {
        type: String,
        required: true,
    },
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;