# FNTE Property Custom API Documentation

## API Endpoint
```
POST https://3g9m221zcj.execute-api.us-east-1.amazonaws.com/prod/property
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "address": "string"
}
```

#### Parameters:
- **address** (required): The property address to look up. Supports multiple formats:
  - Comma-separated: `"1234 Oak Street, Denver, CO 80202"`
  - Space-separated: `"567 MAIN ST AUSTIN TX 73301"`

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    // Property information data
  },
  "request": {
    "address": "original address string",
    "parsedAddress": {
      "address1": "street address",
      "address2": "city, state zip"
    },
    "service": "property-lookup"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error type",
  "message": "detailed error message",
  "request": {
    "address": "original address string",
    "service": "property-lookup"
  }
}
```

## Example Usage

### cURL
```bash
curl -X POST https://3g9m221zcj.execute-api.us-east-1.amazonaws.com/prod/property \
  -H "Content-Type: application/json" \
  -d '{
    "address": "1234 Oak Street, Denver, CO 80202"
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('https://3g9m221zcj.execute-api.us-east-1.amazonaws.com/prod/property', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    address: '1234 Oak Street, Denver, CO 80202'
  })
});

const data = await response.json();
```

### Python
```python
import requests

url = 'https://3g9m221zcj.execute-api.us-east-1.amazonaws.com/prod/property'
payload = {
    'address': '1234 Oak Street, Denver, CO 80202'
}

response = requests.post(url, json=payload)
data = response.json()
```

## Response Data Structure

The API returns comprehensive property information including:

- **Property Identification**: ID, APN, property identifier
- **Address Information**: Full address, coordinates, accuracy level
- **Property Details**: Type, year built, lot size, living area
- **Building Information**: Rooms, construction type, condition
- **Owner Information**: Absentee indicator
- **Location Data**: County, municipality, geo IDs

## CORS Support

The API supports CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token`

## Rate Limiting

Please implement appropriate delays between requests (recommended: 300-500ms) to avoid rate limiting.

## Error Codes

- **400 Bad Request**: Missing required parameters or invalid request format
- **500 Internal Server Error**: API request failed or server error
- **Other codes**: Authentication errors (401), access forbidden (403), rate limit exceeded (429), etc.

## Support

For issues or questions about this API, contact the FNTE development team.

---
Generated: July 21, 2025