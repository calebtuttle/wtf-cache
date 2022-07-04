# WTF-Cache
A simple server-side cache for data stored on WTF Protocol smart contracts. The data in this cache is exposed via API endpoints.

Endpoints:
- /api/getAllUserAddresses
- /api/getHolo?address=<crypto_address>
- /api/addressForCredentials?credentials=<user_credentials>&service=<service_that_issued_credentials>
- /api/searchHolos?searchStr=<search_str>


## Setup
Clone this repository.

    git clone https://github.com/opscientia/wtf-cache.git
    
Change directory into wtf-api.

    cd wtf-cache

This package was developed with Node v16.14.2. If you are using nvm, run:

    nvm use

Install dependencies.

    npm install

Start server on http://localhost:3001

    node src/cache-server.js

Start cache-updater (which, at regular intervals, retrieves on-chain data and updates the database)

    node src/cache-updater.js
