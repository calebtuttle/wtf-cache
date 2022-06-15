# WTF-Cache
A simple server-side cache for data stored on WTF Protocol smart contracts. The data in this cache is exposed via API endpoints.

Endpoints:
- /getAllUserAddresses
- /getHolo?address=<crypto_address>
- /addressForCredentials?credentials=<user_credentials>&service=<service_that_issued_credentials>
- /searchHolos?searchStr=<search_str>

# getHolo/
Return shape:

    {
        address: <address>,
        <chain_1>: {
            <service_1>: <credentials_for_service_1_on_chain_1>,
            <service_2>: <credentials_for_service_2_on_chain_1>,
            ...
            <service_i>: <credentials_for_service_i_on_chain_1>
        },
        <chain_2>: {
            <service_1>: <credentials_for_service_1_on_chain_2>,
            <service_2>: <credentials_for_service_2_on_chain_2>,
            ...
            <service_i>: <credentials_for_service_i_on_chain_2>
        },
        ...
    }

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
