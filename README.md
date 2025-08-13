# Workout Planner ️‍♂️

A full-stack workout tracking application with AI-powered analysis and workout generation.

## Features

- **User Authentication** – Secure login/register system  
- **Workout Management** – Create, edit, and delete workouts  
- **Exercise Tracking** – Track sets, reps, and weights  
- **AI Analysis** – Get intelligent feedback on your workouts  
- **✨ AI Generation** – Automatically generate complete workout plans  
- **Responsive Design** – Optimized for both desktop and mobile  

## Tech Stack

**Frontend:**
- React.js  
- React Router  
- Modern CSS with custom styling  

**Backend:**
- Django 3.2  
- Django REST Framework  
- Google Gemini AI API  
- SQLite Database  

## Quick Start

### Prerequisites
- Python 3.10+  
- Node.js 14+  
- Google AI API Key  

### Backend Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/Anoshpshroff/workout_planner.git
    cd workout_planner
    ```
2. Create and activate a virtual environment:
    ```bash
    python3 -m venv env
    source env/bin/activate  # or `env\Scripts\activate` on Windows
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Configure environment variables:
    - Create a `.env` file in the backend directory (if applicable).
    - Add your API key, for example:
      ```env
      GOOGLE_AI_API_KEY=your_api_key_here
      ```
5. Apply database migrations and run the development server:
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies and start up the React dev server:
    ```bash
    npm install
    npm start
    ```
3. Your app should now be live at: `http://localhost:3000`

## Directory Structure
workout_planner/
├── frontend/ # React.js frontend
└── workout_planner/ # Django backend
├── manage.py
├── workouts/ # Your app(s)
├── …other Django files…

yaml
Copy
Edit
