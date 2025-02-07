# Samma (سماء) - Arabic Digital Games Store

Samma is a feature-rich Arabic digital games marketplace where users can buy, sell, and discover games. The platform includes advanced features such as dynamic ad placement through bidding, user ratings, and comments.

## Features

- User authentication and profile management
- Game listing and management
- PayPal integration for secure payments
- Dynamic ad placement through bidding system
- Rating system (up to 10 stars)
- Comment system
- Category and tag-based organization
- Arabic language support with RTL

## Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Queue**: Celery
- **Payment Processing**: PayPal API

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/samma.git
   cd samma
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

6. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

7. Run the development servers:
   ```bash
   # Backend (from project root)
   python manage.py runserver

   # Frontend (from frontend directory)
   npm run dev
   ```

## Development

- Backend API runs on: http://localhost:8000
- Frontend dev server runs on: http://localhost:3000
- Admin interface: http://localhost:8000/admin

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 