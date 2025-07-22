# ATTOM API Connectivity Guide

## Overview
This document contains all the essential connectivity information needed to build new functions that integrate with the ATTOM Data API. The information is extracted from the working implementations in this project.

## Core API Configuration

### Base URLs
- **Primary Base URL:** `https://api.gateway.attomdata.com`
- **Base Host (for HTTP client):** `api.gateway.attomdata.com`
- **Property API Base:** `https://api.gateway.attomdata.com/propertyapi/v1.0.0`

### API Key
```
d76915820504e4959c9065b3630f4aa7
```

### Authentication Headers
```python
headers = {
    'accept': 'application/json',
    'apikey': 'your_api_key_here'
}
```

## API Endpoint Structure

### Primary API Versions
- **Property API v1.0.0:** `/propertyapi/v1.0.0/`
- **API v4:** `/v4/`
- **Property v3:** `/property/v3/`
- **Property v2:** `/property/v2/`

## Working Endpoints (Verified Available)

### Core Property Data
- `/propertyapi/v1.0.0/property/detail` - Comprehensive property details
- `/propertyapi/v1.0.0/property/basicprofile` - Basic property profile
- `/propertyapi/v1.0.0/property/expandedprofile` - Extended property profile
- `/propertyapi/v1.0.0/property/detailmortgage` - Mortgage details
- `/propertyapi/v1.0.0/property/detailmortgageowner` - Mortgage owner details

### Sales History
- `/propertyapi/v1.0.0/saleshistory/detail` - Detailed sales history
- `/propertyapi/v1.0.0/saleshistory/snapshot` - Sales snapshot
- `/propertyapi/v1.0.0/saleshistory/basichistory` - Basic sales history
- `/propertyapi/v1.0.0/saleshistory/expandedhistory` - Extended sales history

### Automated Valuation Model (AVM)
- `/propertyapi/v1.0.0/avm/detail` - Detailed property valuation
- `/propertyapi/v1.0.0/avm/snapshot` - Valuation snapshot
- `/propertyapi/v1.0.0/avm/rental` - Rental valuation

### Assessment Data
- `/propertyapi/v1.0.0/assessment/detail` - Assessment details
- `/propertyapi/v1.0.0/assessment/snapshot` - Assessment snapshot
- `/propertyapi/v1.0.0/assessmenthistory/detail` - Assessment history

### Schools & Education
- `/propertyapi/v1.0.0/school/district` - School district information
- `/propertyapi/v1.0.0/school/search` - School search

### Location & Environment
- `/propertyapi/v1.0.0/comparables` - Comparable properties
- `/propertyapi/v1.0.0/hazard/detail` - Environmental hazards
- `/propertyapi/v1.0.0/boundary/detail` - Property boundaries
- `/propertyapi/v1.0.0/poi` - Points of interest
- `/propertyapi/v1.0.0/transportation/noise` - Transportation noise data

### Additional Endpoints
- `/propertyapi/v1.0.0/allevents/detail` - All property events
- `/propertyapi/v1.0.0/preforeclosure/details` - Preforeclosure data
- `/propertyapi/v1.0.0/valuation/homeequity` - Home equity valuation
- `/propertyapi/v1.0.0/property/building/permits` - Building permits
- `/propertyapi/v1.0.0/retail/lookup` - Retail information
- `/propertyapi/v1.0.0/neighborhood/community` - Neighborhood data

## Request Parameters

### Required Parameters (Address-based queries)
- **address1:** Street address (e.g., "120 Fraser Ave", "494 BROADWAY")
- **address2:** City, State, ZIP (e.g., "Santa Monica, CA 90405", "NEWPORT, RI 02840")

### Optional Parameters
- **postal:** ZIP code (can be separate from address2)
- **state:** State abbreviation
- **propertyid:** ATTOM property ID (alternative to address)

## Implementation Examples

### Using Python Requests Library
```python
import requests
import json

def make_attom_request(endpoint, address1, address2, api_key):
    """Make a request to ATTOM API using requests library"""
    url = f"https://api.gateway.attomdata.com{endpoint}"
    
    params = {
        'address1': address1,
        'address2': address2
    }
    
    headers = {
        'accept': 'application/json',
        'apikey': api_key
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'error': f'HTTP {response.status_code}', 
                'message': response.text
            }
    except requests.exceptions.RequestException as e:
        return {'error': f'Request failed: {str(e)}'}

# Example usage
api_key = "d76915820504e4959c9065b3630f4aa7"
data = make_attom_request(
    "/propertyapi/v1.0.0/property/detail", 
    "120 Fraser Ave", 
    "Santa Monica, CA 90405", 
    api_key
)
```

### Using HTTP Client Library
```python
import http.client
import urllib.parse
import json

def make_attom_request_http_client(endpoint, address_parts, api_key):
    """Make a request to ATTOM API using http.client"""
    try:
        conn = http.client.HTTPSConnection("api.gateway.attomdata.com")
        
        headers = {
            'accept': "application/json",
            'apikey': api_key,
        }
        
        # Build URL with properly encoded parameters
        params = urllib.parse.urlencode(address_parts)
        url = f"{endpoint}?{params}"
        
        conn.request("GET", url, headers=headers)
        res = conn.getresponse()
        data = res.read()
        conn.close()
        
        if res.status == 200:
            return json.loads(data.decode("utf-8"))
        else:
            return {"error": f"HTTP {res.status}: {data.decode('utf-8')}"}
            
    except Exception as e:
        return {"error": f"Exception: {str(e)}"}

# Example usage
api_key = "d76915820504e4959c9065b3630f4aa7"
address_parts = {
    'address1': '120 Fraser Ave',
    'address2': 'Santa Monica, CA 90405'
}
data = make_attom_request_http_client(
    "/propertyapi/v1.0.0/property/detail", 
    address_parts, 
    api_key
)
```

## Error Handling

### HTTP Status Codes
- **200:** Success - Data returned
- **401:** Unauthorized - Invalid or missing API key
- **403:** Forbidden - Endpoint not available in your plan
- **404:** Not Found - Endpoint doesn't exist
- **429:** Too Many Requests - Rate limit exceeded
- **500:** Internal Server Error - API issue

### Error Response Handling
```python
def handle_attom_response(response_data):
    """Handle ATTOM API response and errors"""
    if 'error' in response_data:
        print(f"Error: {response_data['error']}")
        return None
    
    if 'property' in response_data and response_data['property']:
        return response_data['property'][0]  # Return first property
    else:
        print("No property data found")
        return None
```

## Rate Limiting

### Best Practices
- Include delays between requests to avoid rate limiting
- Recommended delay: 300-500ms between requests

```python
import time

# Add delay between API calls
time.sleep(0.3)  # 300ms delay
```

## Data Structure Examples

### Property Detail Response Structure
```json
{
  "status": {
    "version": "1.0.0",
    "code": 0,
    "msg": "SuccessWithResult",
    "total": 1,
    "page": 1,
    "pagesize": 10
  },
  "property": [
    {
      "identifier": {
        "Id": "property_id",
        "fips": "fips_code"
      },
      "address": {
        "country": "US",
        "countrySubd": "CA",
        "line1": "120 Fraser Ave",
        "line2": "Santa Monica CA 90405",
        "locality": "Santa Monica",
        "matchCode": "ExaStr",
        "oneLine": "120 Fraser Ave, Santa Monica, CA 90405",
        "postal1": "90405",
        "postal2": "1234",
        "postal3": "C032"
      },
      "summary": {
        "propertyType": "SFR",
        "yearbuilt": 1950,
        "propclass": "Single Family Residence / Townhouse",
        "propsubtype": "Single Family Residence",
        "propLandUse": "SFR"
      },
      "building": {
        "size": {
          "livingsize": 2000,
          "lotsize1": 6000
        },
        "rooms": {
          "beds": 3,
          "bathstotal": 2
        }
      }
    }
  ]
}
```

## Address Parsing

### Flexible Address Input Handling
```python
def parse_address(address_input):
    """Parse various address input formats"""
    # Handle "Street, City State ZIP" format
    if ',' in address_input:
        parts = address_input.split(',')
        if len(parts) >= 2:
            address1 = parts[0].strip()
            address2 = ','.join(parts[1:]).strip()
            return {'address1': address1, 'address2': address2}
    
    # Handle space-separated format
    parts = address_input.split()
    if len(parts) >= 4:
        # Try to identify city, state, zip
        # Implementation depends on specific requirements
        pass
    
    return None
```

## Complete Class Implementation Template

```python
class AttomAPIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0'
        self.headers = {
            "accept": "application/json",
            "apikey": self.api_key
        }
    
    def make_request(self, endpoint, params):
        """Make API request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if 'property' in data and data['property']:
                    return {'success': True, 'data': data}
                else:
                    return {'success': False, 'error': 'No property data found'}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': f'Request failed: {str(e)}'}
    
    def get_property_detail(self, address1, address2):
        """Get comprehensive property details"""
        params = {'address1': address1, 'address2': address2}
        return self.make_request('/property/detail', params)
    
    def get_sales_history(self, address1, address2):
        """Get property sales history"""
        params = {'address1': address1, 'address2': address2}
        return self.make_request('/saleshistory/detail', params)
    
    def get_property_valuation(self, address1, address2):
        """Get automated property valuation"""
        params = {'address1': address1, 'address2': address2}
        return self.make_request('/avm/detail', params)
```

## Testing Your Implementation

### Test Address Examples
- **Test Address 1:** "120 Fraser Ave", "Santa Monica, CA 90405"
- **Test Address 2:** "494 BROADWAY", "NEWPORT, RI 02840"
- **Test Address 3:** "10530 EXETER AVE NE", "Seattle, WA"

### Validation Checklist
- [ ] API key is correctly included in headers
- [ ] Base URL is properly constructed
- [ ] Address parameters are correctly formatted
- [ ] Error handling covers all HTTP status codes
- [ ] Rate limiting delays are implemented
- [ ] Response data structure is properly parsed

## Notes

- Some endpoints require higher-tier API plans
- Always include proper error handling for production use
- Monitor rate limits to avoid service interruption
- The API key in this guide is from the project files - ensure it's still valid for your use
- Consider implementing caching for frequently requested data
- Test with multiple address formats to ensure robust parsing

---

**Generated:** July 21, 2025  
**Source:** ATTOM API Project Analysis
