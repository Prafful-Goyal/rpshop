# T-shirt Store

This project includes:

- A storefront for browsing T-shirts
- A MongoDB-backed Node.js + Express API
- Admin pages for products, users, and orders
- Razorpay checkout integration
- Docker support for Google Cloud Run deployment

## Setup

1. Install dependencies with `npm install`.
2. Create a `.env` file with:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
SHIPPING_MODE=manual
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
PUBLIC_SITE_URL=https://rpshop.in
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=RPStore <no-reply@rpstore.in>
SUPPORT_EMAIL=support@rpstore.in
SHIPROCKET_ENABLED=false
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_AUTH_ENDPOINT=/auth/login
SHIPROCKET_ORDER_ENDPOINT=/orders/create/adhoc
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_PACKAGE_LENGTH=10
SHIPROCKET_PACKAGE_BREADTH=10
SHIPROCKET_PACKAGE_HEIGHT=2
SHIPROCKET_PACKAGE_WEIGHT=0.3
SHIPROCKET_FALLBACK_PHONE=9999999999
PORT=3000
```

3. Start the app with `npm start`.

## Netlify deployment

This project is ready for Netlify:

- `public/` is the static site publish directory
- `netlify/functions/api.js` exposes the Express API
- `netlify.toml` rewrites `/api/*` and `/admin`

Deploy with either the Netlify UI or the CLI:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Add these environment variables in Netlify Site Settings:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
SHIPPING_MODE=manual
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://rpshop.in/api/auth/google/callback
PUBLIC_SITE_URL=https://rpshop.in
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=RPStore <no-reply@rpstore.in>
SUPPORT_EMAIL=support@rpstore.in
SHIPROCKET_ENABLED=false
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
SHIPROCKET_AUTH_ENDPOINT=/auth/login
SHIPROCKET_ORDER_ENDPOINT=/orders/create/adhoc
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_PACKAGE_LENGTH=10
SHIPROCKET_PACKAGE_BREADTH=10
SHIPROCKET_PACKAGE_HEIGHT=2
SHIPROCKET_PACKAGE_WEIGHT=0.3
SHIPROCKET_FALLBACK_PHONE=9999999999
```

Google sign-in uses Passport OAuth. Add the callback URL above in your Google Cloud OAuth client and keep the same value in Netlify environment variables.

Shipping is manual by default. Set `SHIPPING_MODE=shiprocket` and `SHIPROCKET_ENABLED=true` only after you enter your Shiprocket email and password in your environment variables. In manual mode, the admin Orders page keeps courier name, delivery agent number, tracking number, and ETA editable without trying to create Shiprocket shipments automatically.

## Razorpay bank account

The bank account is added in the Razorpay dashboard, not in code. Once you connect the bank account there, the checkout flow in this app will use the live Razorpay keys.
