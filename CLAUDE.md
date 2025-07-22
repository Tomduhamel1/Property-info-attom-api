# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js AWS Lambda function that provides property information by integrating with the ATTOM Data API. The function accepts an address and returns detailed property data.

## Commands

### Development
```bash
# Install dependencies
npm install

# Create deployment package
zip -r function.zip index.js node_modules/

# Run locally (requires manual testing as no test runner is configured)
node -e "const handler = require('./index.js').handler; handler({body: JSON.stringify({address: 'YOUR_ADDRESS_HERE'})}, {}, (err, res) => console.log(err || res))"
```

### Environment Setup
- Set `ATTOM_API_KEY` environment variable before running
- For local development, create a `.env` file with: `ATTOM_API_KEY=your_api_key_here`

## Architecture

### Lambda Handler Pattern
The main entry point is `index.js` which exports a single handler function following AWS Lambda conventions:
- Receives event object with JSON body containing `address` parameter
- Returns response object with `statusCode`, `headers`, and `body`
- Uses callback pattern: `exports.handler = async (event, context, callback)`

### API Integration
- Uses axios for HTTP requests to ATTOM Data API
- Endpoint: `https://api.attomdata.com/property/v3/details/address`
- Authentication via API key in headers
- Returns property details including ownership, assessment, and building information

### Error Handling
The function handles:
- Missing address parameter (400 error)
- API request failures (500 error with details)
- Successful responses (200 with property data)

## Key Files

- `index.js`: Main Lambda handler - contains all business logic
- `function.zip`: Deployment package ready for AWS Lambda upload
- `package.json`: Minimal configuration with axios dependency

## Important Notes

- No testing framework is configured - manual testing required
- No TypeScript or build process - pure JavaScript
- Deployment is manual via AWS Console or CLI using function.zip
- Environment variables must be configured in Lambda console for production