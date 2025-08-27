# Decentralized Voting System

A blockchain-based voting application that combines Ethereum smart contracts for secure voting with a traditional database for user authentication.

![Voting System Banner](Decentralized-Voting-System-main/public/index%20ss.png)

## Overview

This project implements a decentralized voting system with a hybrid architecture:
- **Blockchain Layer**: Ethereum smart contracts for transparent and tamper-proof vote recording
- **Authentication Layer**: Traditional database system for user identity management
- **Web Interface**: Modern responsive interface for both administrators and voters

## Features

### Admin Features
- Add new election candidates
- Set voting start and end dates
- View real-time voting results
- Secure admin authentication

### Voter Features
- Secure user authentication
- View available candidates
- Cast votes securely on the blockchain
- View live election results

## Technology Stack

### Blockchain
- Solidity (Smart Contract Development)
- Truffle Framework (Development & Testing)
- Ganache (Local Ethereum Blockchain)
- Web3.js (Blockchain Interaction)

### Backend
- Python Flask (Authentication API)
- MySQL Database (User Credentials)

### Frontend
- HTML5/CSS3
- JavaScript
- jQuery
- Bootstrap

### Tools
- MetaMask (Ethereum Wallet)
- Browserify (JavaScript Bundling)

## Project Structure

```
├── contracts/            # Solidity smart contracts
├── migrations/           # Truffle migration files
├── src/
│   ├── assets/           # Images and resources
│   ├── css/              # Stylesheets
│   ├── html/             # HTML pages
│   │   ├── admin.html    # Admin panel
│   │   ├── index.html    # Voter interface
│   │   └── login.html    # Authentication page
│   └── js/               # JavaScript files
│       ├── app.js        # Main application logic
│       ├── app_hybrid.js # Combined blockchain/DB logic
│       └── login.js      # Authentication logic
├── Database_API/         # Python Flask backend
│   └── main.py           # Authentication API
└── public/               # Public assets and screenshots
```

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v12.0.0 or higher)
- [Truffle](https://www.trufflesuite.com/truffle) (`npm install -g truffle`)
- [Ganache](https://www.trufflesuite.com/ganache)
- [MetaMask](https://metamask.io/) browser extension
- [Python](https://www.python.org/) (v3.6 or higher)
- [MySQL](https://www.mysql.com/)

### Blockchain Setup
1. Clone the repository:
   ```
   git clone https://github.com/hypfrw7/decentralized-voting-system.git
   cd decentralized-voting-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start Ganache (GUI or CLI)

4. Compile and deploy smart contracts:
   ```
   truffle compile
   truffle migrate --reset
   ```

5. Note the contract address displayed after migration

### Database Setup
1. Set up MySQL database:
   ```sql
   CREATE DATABASE voting_system;
   USE voting_system;
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(50) NOT NULL,
     password VARCHAR(255) NOT NULL,
     is_admin BOOLEAN DEFAULT FALSE
   );
   
   -- Create default admin user
   INSERT INTO users (username, password, is_admin) 
   VALUES ('admin', 'admin123', TRUE);
   
   -- Create sample regular users
   INSERT INTO users (username, password, is_admin) 
   VALUES ('user1', 'user123', FALSE);
   ```

2. Install Python dependencies:
   ```
   cd Database_API
   pip install flask flask-cors mysql-connector-python
   ```

3. Update database connection details in `Database_API/main.py` if necessary

### Frontend Setup
1. Configure MetaMask:
   - Connect MetaMask to Ganache (usually http://127.0.0.1:7545, Network ID 5777)
   - Import accounts from Ganache using private keys

2. Update contract address in `src/js/app_hybrid.js` if necessary

3. Bundle JavaScript:
   ```
   npm install -g browserify
   browserify src/js/app_hybrid.js -o src/js/bundle.js
   ```

### Running the Application
1. Start the authentication API:
   ```
   cd Database_API
   python main.py
   ```
   The API will run at http://localhost:8000

2. Serve the frontend:
   ```
   cd ..
   npm install -g http-server
   http-server -p 3000
   ```
   
3. Visit http://localhost:3000/src/html/login.html in your browser

## Usage Guide

### Admin Login
1. Login with admin credentials (default: admin/admin123)
2. Set voting period start and end dates
3. Add candidates with names and party affiliations
4. Monitor voting results

### Voter Login
1. Login with user credentials (default: user1/user123)
2. View list of candidates
3. Cast your vote using MetaMask to sign the transaction
4. View current voting results

## Project Demo

> **Note:** The following screenshots are from 2023 and are for illustration purposes only. The current version of the application (2025) has an updated interface and features compared to these reference images.

### Login Screen
![Login Screen](Decentralized-Voting-System-main/public/login%20ss.png)

### Admin Panel
![Admin Panel](Decentralized-Voting-System-main/public/admin%20ss.png)

### Voting Interface
![Voting Interface](Decentralized-Voting-System-main/public/index%20ss.png)

## Security Features

- **Immutable Voting Records**: Once cast, votes cannot be altered
- **Single Vote Enforcement**: Smart contract prevents double-voting
- **Time-bound Voting**: Configurable voting period with automatic enforcement
- **Authentication**: Separate authentication layer for identity management
- **Transaction Signing**: All votes require cryptographic signing through MetaMask

## Future Enhancements

- [ ] Implement more advanced voter verification
- [ ] Add support for multiple simultaneous elections
- [ ] Enhance the UI with real-time updates
- [ ] Deploy to a public testnet (Rinkeby, Ropsten)
- [ ] Add comprehensive unit tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ethereum Foundation for blockchain technology
- Truffle Suite for development tools
- OpenZeppelin for smart contract patterns
