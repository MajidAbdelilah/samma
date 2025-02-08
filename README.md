# Samma (سماء) - Arabic Digital Games Store

Samma is a feature-rich Arabic digital games marketplace where users can buy, sell, and discover games. The platform includes advanced features such as dynamic ad placement through bidding, user ratings, and comments.

## Project Structure

The project is divided into two main parts:

### Backend (`/backend`)
- Django + Django REST Framework
- PostgreSQL database
- Redis for caching
- Celery for task queue
- PayPal integration
- JWT authentication

### Frontend (`/frontend`)
- Next.js
- TypeScript
- Chakra UI
- PayPal React components
- RTL support for Arabic

## Key Features

- User authentication and profile management
  - Secure registration and login
  - Email verification
  - Profile customization
  - Transaction history

- Game Marketplace
  - Game listing and management
  - Secure PayPal integration for payments
  - Dynamic ad placement through bidding system
  - Automated revenue sharing based on bids

- Advanced Bidding System
  - Minimum 5% platform fee for listing
  - Bid on category/tag placement
  - Dynamic ranking algorithm based on:
    - Bid amount
    - Game rating
    - Comment count

- Rating & Comments
  - 10-star rating system
  - Threaded comments
  - Content moderation tools

- Discovery Features  
  - Category-based organization
  - Tag-based filtering
  - Search functionality
  - Dynamic front page featuring top games

- Arabic Language Support
  - Full RTL interface
  - Arabic content management
  - Localized user experience

## Prerequisites

Backend:
- Python 3.10+
- PostgreSQL 14+
- Redis 6+

Frontend:
- Node.js 18+
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend API runs on: http://localhost:8000
- Frontend dev server runs on: http://localhost:3000
- Admin interface: http://localhost:8000/admin

## API Documentation

The API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Security Features

- JWT-based authentication
- HTTPS enforcement
- Input validation and sanitization
- CSRF protection
- Secure session management
- PayPal secure integration

## Performance Optimizations

- Redis caching for frequently accessed data
- Optimized database queries
- CDN integration for static assets
- Lazy loading of images and components
- Efficient bidding algorithm implementation

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 