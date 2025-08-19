# Vroom 🚗

A modern, full-stack ride-sharing platform built with Next.js and Node.js, featuring real-time tracking, payment integration, and comprehensive admin management.

## Features

### For Passengers
- **Easy Booking**: Book rides with real-time location tracking
- **Live Tracking**: Track your driver's location in real-time
- **Secure Payments**: Integrated bKash payment system
- **Trip History**: View all your past rides and receipts
- **Profile Management**: Update personal information and preferences

### For Drivers
- **Driver Dashboard**: Manage your driving schedule and earnings
- **Ride Requests**: Accept or decline ride requests
- **Navigation**: Built-in route guidance and tracking
- **Earnings Tracking**: Monitor your income and trip statistics
- **Document Management**: Upload and manage required documents

### For Administrators
- **User Management**: Oversee all drivers and passengers
- **Driver Verification**: Approve or reject driver applications
- **Revenue Analytics**: Track platform earnings and statistics
- **Support System**: Handle user inquiries and issues

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- React Hook Form
- React Icons
- Socket.io Client

**Backend:**
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)
- Nodemailer

**Maps & Location:**
- Leaflet Maps
- OpenStreetMap
- Geolocation API

**Payment:**
- bKash Payment Gateway
- Secure transaction handling

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Piccolo7210/Vroom.git
   cd Vroom
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` in the server directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@domain.com
   EMAIL_PASS=your_email_password
   BKASH_APP_KEY=your_bkash_app_key
   BKASH_APP_SECRET=your_bkash_app_secret
   ```

5. **Start the development servers**
   
   Terminal 1 (Server):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Client):
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development Tools

### Location Testing
For testing location features during development, use our Chrome launcher script:

```bash
chmod +x launch-chrome.sh
./launch-chrome.sh
```

This script launches Chrome with the necessary flags to enable geolocation on IP addresses.

### Quick Development Setup
Use our development starter script:

```bash
chmod +x start-dev.sh
./start-dev.sh
```

## Project Structure

```
Vroom/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
├── server/                # Express.js backend
│   ├── controllers/      # Route handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
└── docs/                 # Documentation
```

## Key Features

### Real-time Communication
- Live location updates using Socket.io
- Instant ride status notifications
- Real-time chat between drivers and passengers

### Advanced Map Integration
- Interactive maps with route planning
- Geofencing for pickup/drop-off zones
- Distance and fare calculations

### Security & Authentication
- JWT-based authentication
- Role-based access control
- Secure file upload handling
- Data validation and sanitization

### Payment System
- Integrated bKash payment gateway
- Secure transaction processing
- Payment history and receipts
- Automatic fare calculations

## Browser Compatibility

Vroom works best on modern browsers with geolocation support:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

For development with IP addresses, Chrome flags are required (handled automatically by our launch script).

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## Deployment

### Production Environment Variables
Ensure all environment variables are properly configured for production:
- Database connection strings
- API keys for payment gateways
- Email service credentials
- JWT secrets

### Recommended Hosting
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas

## Support & Documentation

- **Location Issues**: See [LOCATION_ACCESS_GUIDE.md](LOCATION_ACCESS_GUIDE.md)
- **Payment Integration**: See [PAYMENT_SYSTEM_DOCUMENTATION.md](PAYMENT_SYSTEM_DOCUMENTATION.md)
- **API Documentation**: Available at `/api-docs` when server is running

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenStreetMap for mapping services
- bKash for payment integration
- The open-source community for various libraries and tools

---

**Built with ❤️ by the Vroom Team**

For support or questions, please open an issue or contact us at support@vroom.com
