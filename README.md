# LoanApp Frontend

A professional React frontend for the LoanApp loan management system.

## Features

### 🔐 Authentication
- User registration (Borrower/Officer roles)
- Secure login with JWT tokens
- Role-based access control
- Automatic token management

### 👤 Borrower Dashboard
- Complete profile creation
- Loan application submission
- Document upload management
- Application status tracking
- Loan payment calculator

### 👨‍💼 Officer Dashboard
- Review pending loan applications
- Approve/reject applications with reasons
- Document verification
- Status management
- Real-time statistics

### 🎨 Modern UI
- Responsive Tailwind CSS design
- Professional color scheme
- Interactive components
- Mobile-friendly layout

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **JWT** - Authentication tokens

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Backend Requirements
Ensure your backend services are running:
- API Gateway: `http://localhost:4000`
- Auth Service: `http://localhost:4005`
- Borrower Service: `http://localhost:4001`
- Officer Service: `http://localhost:8083`

## Demo Accounts

### Borrower Account
- **Email**: john.doe@example.com
- **Password**: SecurePassword123!

### Officer Account
- **Email**: officer.smith@company.com
- **Password**: OfficerPass123!

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Common/          # Generic components
│   └── Layout/          # Navigation, footer
├── contexts/            # React Context providers
├── pages/               # Page components
│   ├── Auth/           # Login, register
│   ├── Borrower/       # Borrower dashboard, applications
│   └── Officer/        # Officer dashboard, reviews
├── services/           # API service layer
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles

```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## API Integration

The frontend integrates with your microservices architecture:

### Authentication Endpoints
- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- GET `/auth/validate/{role}` - Token validation

### Borrower Endpoints (via API Gateway)
- POST `/api/borrowers` - Create profile
- GET `/api/borrowers/{id}` - Get profile
- POST `/api/borrowers/{id}/loan-applications` - Submit loan
- GET `/api/borrowers/{id}/loan-applications` - Get loans
- POST `/api/borrowers/{id}/documents` - Upload document

### Officer Endpoints (via API Gateway)
- GET `/admin/loans` - Get all loan applications
- PUT `/admin/loans/{id}/status` - Update loan status
- GET `/admin/documents` - Get all documents
- PUT `/admin/documents/{id}/status` - Update document status

## Features in Detail

### 🚀 Borrower Flow
1. **Registration** - Create account with personal details
2. **Profile Completion** - Add employment and address info
3. **Loan Application** - Submit loan request with purpose
4. **Document Upload** - Provide supporting documents
5. **Status Tracking** - Monitor application progress

### 🏢 Officer Flow
1. **Dashboard Overview** - See all pending applications
2. **Application Review** - Detailed loan analysis
3. **Document Verification** - Review submitted documents
4. **Status Management** - Approve/reject with reasons
5. **Real-time Updates** - Kafka event synchronization

### 🎯 Key Features
- **Responsive Design** - Works on all devices
- **Real-time Updates** - Status changes sync via Kafka
- **Secure Authentication** - JWT token management
- **Role-based Access** - Different views for borrowers/officers
- **Professional UI** - Modern, clean interface
- **Error Handling** - Comprehensive error management
- **Loading States** - Smooth user experience

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

Deploy the `build` folder to your web server.

### Environment Variables
Create `.env` file for production:
```
REACT_APP_API_URL=https://your-api-gateway.com
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Follow Tailwind CSS utility classes

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3000`

2. **API Connection Issues**
   - Verify backend services are running
   - Check API Gateway routes

3. **Authentication Problems**
   - Clear localStorage and try again
   - Verify JWT token format

### Development Tips

1. Use React Developer Tools
2. Check browser console for errors
3. Verify network requests in DevTools
4. Test with different user roles

## License

This project is part of the LoanApp microservices system.
