# WTF-Cache
A simple server-side cache for data stored on WTF Protocol smart contracts. The data in this cache is exposed via API endpoints.

Endpoints:
- /getAllUserAddresses
- /getHolo?address=<crypto_address>
- /addressForCredentials?credentials=<credentials>&service=<service>

## Setup
Clone this repository.

    git clone https://github.com/calebtuttle/wtf-cache.git
    
Change directory into wtf-api.

    cd wtf-cache

This package was developed with Node v16.14.2. If you are using nvm, run:

    nvm use

Install dependencies.

    npm install

Start server on http://localhost:3000

    npm run start
