# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains AWS Lambda functions that provide property information by integrating with the ATTOM Data API. There are two implementations:
- **Root**: Basic prototype using axios (`/index.js`)
- **Production**: Full-featured implementation (`/fnte-prop-custom/index.js`)

## Commands

### Development
```bash
# Install dependencies (root implementation only)
npm install

# Create deployment package (root)
zip -r function.zip index.js node-modules/

# Create deployment package (production)
cd fnte-prop-custom && zip -r function.zip index.js && cd ..

# Test locally (root)
node -e "const handler = require('./index.js').handler; handler({body: JSON.stringify({address: 'YOUR_ADDRESS_HERE'})}, {}, (err, res) => console.log(err || res))"

# Test locally (production)
cd fnte-prop-custom && node test.js "YOUR_ADDRESS_HERE" && cd ..
```

### Environment Setup
- Set `ATTOM_API_KEY` environment variable before running
- For local development, create a `.env` file with: `ATTOM_API_KEY=your_api_key_here`

## Architecture

### Dual Implementation Structure
1. **Root (`/index.js`)**: Basic axios-based implementation for ATTOM API v2
2. **Production (`/fnte-prop-custom/`)**: Advanced implementation with:
   - Native Node.js https module (no external dependencies)
   - Enhanced address parsing (comma and space-separated formats)
   - CORS support for browser requests
   - Response sanitization (removes internal ATTOM identifiers)

### Lambda Handler Pattern
Both implementations follow AWS Lambda conventions:
- Accept event object with JSON body containing `address` parameter
- Return response object with `statusCode`, `headers`, and `body`
- Use callback pattern: `exports.handler = async (event, context, callback)`

### ATTOM API Integration
- Base URL: `https://api.gateway.attomdata.com`
- Authentication via API key in headers (`accept` and `apikey`)
- Multiple API versions (v1.0.0 through v4) with extensive endpoints
- Rate limiting: 300-500ms delays recommended between requests
- See `ATTOM_API_Connectivity_Guide.md` for comprehensive endpoint documentation

### Production API
- Endpoint: `https://3g9m221zcj.execute-api.us-east-1.amazonaws.com/prod/property`
- Method: POST
- Body: `{ "address": "property address" }`
- Returns cleaned property data with ownership, assessment, and building details

## Key Files

- `/index.js`: Basic Lambda handler using axios
- `/fnte-prop-custom/index.js`: Production Lambda handler with enhanced features
- `/ATTOM_API_Connectivity_Guide.md`: Comprehensive ATTOM API documentation
- `/fnte-prop-custom/API_DOCUMENTATION.md`: Public-facing API documentation
- `/fnte-prop-custom/test.js`: Local testing utility for production handler
- `/fnte-prop-custom/trust-policy.json`: IAM role configuration for Lambda

## Important Implementation Details

### Address Parsing (Production)
The production handler intelligently parses addresses:
- Comma-separated: `"123 Main St, City, State ZIP"`
- Space-separated with ZIP: `"123 Main St City State ZIP"`
- Handles various formatting edge cases

### Error Handling
Both implementations provide structured error responses:
- 400: Missing or invalid address parameter
- 500: API request failures with detailed error information
- 200: Successful responses with property data

### Response Cleaning (Production)
Production implementation removes ATTOM internal fields:
- `id`, `hashKey`, `guid`, `fips`, `apn` are filtered out
- Provides cleaner, more focused property data

## Development Notes

- No testing framework configured - use provided test scripts for manual testing
- Pure JavaScript - no TypeScript or build process required
- Deployment via manual ZIP file upload to AWS Lambda
- Environment variables must be configured in Lambda console for production
- CORS headers included in production for browser compatibility