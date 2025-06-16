# Teaching Payment System

## Overview
The Teaching Payment System is a web application designed to manage teacher information, course details, payment calculations, and reporting for educational institutions. This application provides a user-friendly interface for administrators to efficiently handle various aspects of teaching management.

## Features
- **Teacher Management**: Add, edit, and view teacher details, including qualifications and department affiliations.
- **Course Management**: Manage course offerings, semesters, and class sections.
- **Payment Calculation**: Calculate teaching payments based on defined rates and coefficients.
- **Reporting**: Generate reports on teaching payments for individual teachers, departments, and the entire institution.

## Project Structure
```
teaching-payment-system
├── index.html          # Main entry point of the application
├── css
│   ├── styles.css     # Main styles for the application
│   └── responsive.css  # Responsive design styles
├── js
│   ├── app.js         # Application initialization and flow management
│   ├── teacher-management.js  # Teacher management functionalities
│   ├── course-management.js    # Course management functionalities
│   ├── payment-calculation.js   # Payment calculation functions
│   ├── reports.js      # Reporting functionalities
│   └── utils.js        # Utility functions
├── data
│   └── sample-data.js  # Sample data for testing
├── assets
│   └── icons           # Icon files used in the application
└── README.md           # Documentation for the project
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd teaching-payment-system
   ```
3. Open `index.html` in a web browser to view the application.

## Usage
- Use the left sidebar to navigate between different management functionalities.
- Each section provides options to view lists of entities and add new entries.
- Reports can be generated based on teaching payments for various scopes.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.