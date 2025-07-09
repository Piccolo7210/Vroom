import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
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
    license_no: {
        type: String,
        required: true,
        unique: true,
    },
    photo_link: {
        type: String,
    },
    age: {
        type: Number,
        required: true,
    },
    present_address: {
        type: String,
        required: true,
    },
    permanent_address: {
        type: String,
    },
    sex: {
        type: String,
        required: true,
        enum: ['female', 'male','others'] ,
    },
    vehicle_type: {
        type: String,
        required: true,
        enum: ['car', 'bike'],
    },
    vehicle_no: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
    },
});

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
