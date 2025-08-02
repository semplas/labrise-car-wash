# Labrise Car Wash Management System
**B2B Management Dashboard for Car Wash Businesses**

## Core Features

### Authentication & Dashboard
- **Super Admin Portal**: Create and manage business accounts
- **Business Login**: Business owners login with credentials created by super admin
- **Role-based Access**: Different interfaces for super admin vs business users
- Home screen displaying business name and car management overview

### Car Management
- View all cars in management system
- Add new cars via modal with:
  - 4 car images upload
  - License plate number
  - Make, color
  - Owner name, address, phone number
- Search & filter cars by license plate, owner name, service type

### Service Management
- Add/manage services with name, amount, duration
- Assign cleaning services to cars
- Service packages: Bundle services (wash + wax + interior)
- Pricing tiers: Different pricing for car sizes (compact, SUV, truck)

## Super Admin Features

### Business Account Management
- Create new business accounts with:
  - Business name
  - Owner contact information
  - Initial login credentials
  - Subscription plan (free/premium)
- View all registered businesses
- Edit business information
- Deactivate/reactivate business accounts
- Reset business passwords
- Monitor business usage statistics

### System Administration
- View system-wide analytics
- Manage subscription plans
- Monitor storage usage per business
- System maintenance and updates

## Advanced Features

### Customer Management
- Separate customer profiles with contact information
- Complete car history per customer
- Customer service history tracking

### Service History & Tracking
- Complete wash history per car with dates and services performed
- Service completion tracking
- Historical data for analytics

### Queue Management
- Real-time queue status display
- Estimated wait times
- Service assignment and progress tracking

### Staff Management
- Add staff members with role assignments
- Track staff performance metrics
- Role-based access control

### Reporting & Analytics
- Daily/monthly revenue reports
- Popular services analysis
- Customer retention metrics
- Business performance dashboards

### Customer Loyalty
- Points system for repeat customers
- Loyalty program management
- Customer reward tracking

### Technical Features
- Mobile responsive design (tablet/phone friendly)
- Advanced search and filtering capabilities
- Real-time data updates

## Technical Architecture

### Local-First Approach
- **Primary Storage**: Browser localStorage for all data
- **Offline Capability**: Full functionality without internet connection
- **Cross-Device**: Works on desktop and mobile browsers
- **No Installation**: Pure web application, no app store required

### Data Management
- **Local Storage**: All business data stored in browser
- **Image Storage**: Base64 encoded images in localStorage
- **Data Export**: JSON export functionality for data portability
- **Data Import**: Restore from exported JSON files

### Optional Cloud Backup (Future Premium Feature)
- **Paid Service**: Optional cloud sync for data backup
- **Server Push**: Sync local data to secure cloud servers
- **Multi-Device Sync**: Access data across multiple devices
- **Data Recovery**: Restore data if local storage is lost

### Recommended Tech Stack
- **Frontend**: Vanilla JavaScript or React (for PWA capabilities)
- **Styling**: CSS3 with Flexbox/Grid for responsive design
- **Storage**: localStorage API with JSON serialization
- **Images**: FileReader API for image upload and Base64 conversion
- **PWA**: Service Workers for offline functionality
- **Build**: Vite or Webpack for bundling and optimization

## Target Users
- **Super Admin**: System administrators who create and manage business accounts
- **Business Owners**: Car wash business owners managing their operations
- **Business Staff**: Employees with role-based access to business functions