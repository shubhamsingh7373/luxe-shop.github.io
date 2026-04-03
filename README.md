# luxe-shop.github.io
services:
  - type: web
    name: luxe-shop
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run seed && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10001
