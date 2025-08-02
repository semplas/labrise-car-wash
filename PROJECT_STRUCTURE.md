# Labrise Car Wash Management System - Project Structure

## Root Directory Structure
```
labrise/
├── public/
│   ├── index.html
│   ├── manifest.json          # PWA manifest
│   ├── favicon.ico
│   └── icons/                 # PWA icons
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Main page components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Business logic & localStorage
│   ├── utils/                 # Helper functions
│   ├── styles/                # Global styles & themes
│   ├── assets/                # Static assets
│   ├── context/               # React Context providers
│   ├── types/                 # TypeScript types (if using TS)
│   ├── App.js
│   ├── index.js
│   └── App.css
├── package.json
├── README.md
└── labrise.md
```

## Detailed Component Structure

### `/src/components/` - Reusable Components
```
components/
├── common/
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.css
│   ├── Modal/
│   │   ├── Modal.jsx
│   │   └── Modal.css
│   ├── SearchBar/
│   ├── LoadingSpinner/
│   └── ConfirmDialog/
├── forms/
│   ├── CarForm/
│   │   ├── CarForm.jsx
│   │   └── CarForm.css
│   ├── ServiceForm/
│   ├── CustomerForm/
│   └── StaffForm/
├── cards/
│   ├── CarCard/
│   ├── ServiceCard/
│   ├── CustomerCard/
│   └── StaffCard/
└── layout/
    ├── Header/
    ├── Sidebar/
    ├── Navigation/
    └── Footer/
```

### `/src/pages/` - Main Application Pages
```
pages/
├── Auth/
│   ├── Login.jsx
│   ├── SuperAdminLogin.jsx
│   └── Login.css
├── SuperAdmin/
│   ├── Dashboard.jsx
│   ├── BusinessList.jsx
│   ├── CreateBusiness.jsx
│   ├── BusinessDetails.jsx
│   ├── SystemAnalytics.jsx
│   └── SuperAdmin.css
├── Dashboard/
│   ├── Dashboard.jsx
│   └── Dashboard.css
├── Cars/
│   ├── CarsList.jsx
│   ├── CarDetails.jsx
│   └── Cars.css
├── Services/
│   ├── ServicesList.jsx
│   ├── ServicePackages.jsx
│   └── Services.css
├── Customers/
│   ├── CustomersList.jsx
│   ├── CustomerDetails.jsx
│   └── Customers.css
├── Queue/
│   ├── QueueManagement.jsx
│   └── Queue.css
├── Staff/
│   ├── StaffList.jsx
│   ├── StaffPerformance.jsx
│   └── Staff.css
├── Reports/
│   ├── Analytics.jsx
│   ├── Revenue.jsx
│   └── Reports.css
└── Settings/
    ├── BusinessSettings.jsx
    ├── DataManagement.jsx
    └── Settings.css
```

### `/src/services/` - Business Logic & Data Management
```
services/
├── localStorage/
│   ├── storageService.js      # Core localStorage operations
│   ├── superAdminStorage.js   # Super admin operations
│   ├── businessStorage.js     # Business account management
│   ├── carStorage.js          # Car-specific storage
│   ├── serviceStorage.js      # Service-specific storage
│   ├── customerStorage.js     # Customer-specific storage
│   ├── staffStorage.js        # Staff-specific storage
│   └── queueStorage.js        # Queue-specific storage
├── dataValidation/
│   ├── carValidation.js
│   ├── serviceValidation.js
│   └── customerValidation.js
├── imageService.js            # Image upload/compression
├── exportService.js           # Data export functionality
├── importService.js           # Data import functionality
└── analyticsService.js        # Business analytics calculations
```

### `/src/hooks/` - Custom React Hooks
```
hooks/
├── useLocalStorage.js         # Generic localStorage hook
├── useSuperAdmin.js           # Super admin operations hook
├── useBusinessAccounts.js     # Business account management hook
├── useCars.js                 # Car management hook
├── useServices.js             # Service management hook
├── useCustomers.js            # Customer management hook
├── useQueue.js                # Queue management hook
├── useStaff.js                # Staff management hook
├── useSearch.js               # Search functionality hook
├── useAnalytics.js            # Analytics data hook
└── useAuth.js                 # Authentication hook
```

### `/src/context/` - React Context Providers
```
context/
├── AuthContext.js             # Authentication state
├── BusinessContext.js         # Business settings & info
├── ThemeContext.js            # UI theme management
└── NotificationContext.js     # Toast notifications
```

### `/src/utils/` - Helper Functions
```
utils/
├── dateUtils.js               # Date formatting & calculations
├── imageUtils.js              # Image compression & conversion
├── searchUtils.js             # Search & filter logic
├── validationUtils.js         # Form validation helpers
├── exportUtils.js             # Data export helpers
├── constants.js               # App constants
└── formatters.js              # Data formatting functions
```

## Data Structure in localStorage

### Storage Keys
```javascript
// Super Admin storage keys
'labrise_super_admin'          // Super admin credentials
'labrise_businesses'           // Array of all business accounts
'labrise_system_settings'      // System-wide settings

// Business-specific storage keys (prefixed with businessId)
'labrise_business_info_{id}'   // Business name, settings
'labrise_cars_{id}'            // Array of car objects
'labrise_services'             // Array of service objects
'labrise_customers'            // Array of customer objects
'labrise_staff'                // Array of staff objects
'labrise_queue'                // Current queue status
'labrise_service_history'      // Service history records
'labrise_loyalty_points'       // Customer loyalty data
```

### Data Models
```javascript
// Business Account Object
{
  id: string,
  businessName: string,
  ownerName: string,
  email: string,
  phone: string,
  address: string,
  username: string,
  password: string, // hashed
  subscriptionPlan: 'free' | 'premium',
  isActive: boolean,
  createdAt: timestamp,
  lastLogin: timestamp,
  storageUsed: number // in bytes
}

// Super Admin Object
{
  username: string,
  password: string, // hashed
  createdAt: timestamp,
  lastLogin: timestamp
}

// Car Object
{
  id: string,
  licensePlate: string,
  make: string,
  color: string,
  images: [base64Strings],
  owner: {
    name: string,
    address: string,
    phone: string
  },
  customerId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Service Object
{
  id: string,
  name: string,
  amount: number,
  duration: number, // in minutes
  category: string, // 'basic', 'premium', 'package'
  carSizes: ['compact', 'suv', 'truck'],
  createdAt: timestamp
}

// Customer Object
{
  id: string,
  name: string,
  phone: string,
  address: string,
  email: string,
  loyaltyPoints: number,
  totalVisits: number,
  cars: [carIds],
  createdAt: timestamp
}
```

## Development Phases

### Phase 1: Core Foundation
1. Project setup with Create React App
2. Basic routing with React Router
3. Authentication system
4. localStorage service setup
5. Basic car management (CRUD)

### Phase 2: Service Management
1. Service creation and management
2. Service assignment to cars
3. Basic queue management
4. Customer management

### Phase 3: Advanced Features
1. Service history tracking
2. Staff management
3. Search and filtering
4. Basic analytics

### Phase 4: Polish & PWA
1. Mobile responsiveness
2. PWA implementation
3. Data export/import
4. Advanced analytics

This structure provides:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Reusability**: Modular components and hooks
- **Performance**: Optimized localStorage operations
- **Mobile-First**: Responsive design approach

Ready to start coding? Which phase would you like to begin with?