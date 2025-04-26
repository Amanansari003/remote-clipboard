# Clipboard Paste Application

This project is a simple clipboard paste application built with Node.js and Express. It allows users to paste text and generate a unique ID for each paste, enabling others to access the pasted content via a specific URL.

## Features

- Paste text and save it with a unique ID.
- Retrieve pasted content using the unique ID.
- Simple and user-friendly interface.

## Project Structure

```
copy-past
├── src
│   ├── server.js         # Entry point of the application
│   ├── routes
│   │   ├── index.js            # Main routing functions
│   │   └── paste.js            # Routes related to pasting data
│   ├── controllers
│   │   └── pasteController.js   # Handles paste submissions and retrieval
│   ├── models
│   │   └── pasteModel.js       # Defines the Paste model
│   └── utils
│       └── generateId.js       # Utility for generating unique IDs
├── data
│   └── pastes.json             # Storage for pastes
├── package.json                 # npm configuration file
├── README.md                    # Project documentation
└── .gitignore                   # Git ignore file
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd copy-past
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to access the application.
3. Paste your text in the provided textarea and click the "Paste" button.
4. A unique ID will be generated for your paste, which you can share with others to allow them to view the pasted content.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.