const https = require('https');

exports.handler = async (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };
    
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return callback(null, {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        });
    }
    
    let requestData;
    try {
        // Parse request body - handle both direct JSON and API Gateway event format
        if (event.body) {
            requestData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } else if (event.address || event.endpoint) {
            // Direct invocation
            requestData = event;
        } else {
            throw new Error('No request data provided');
        }
    } catch (error) {
        return callback(null, {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid request format', message: error.message })
        });
    }
    
    // Validate required parameters
    const { address } = requestData;
    
    if (!address) {
        return callback(null, {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing required parameter: address' })
        });
    }
    
    // Parse address into address1 and address2
    let address1, address2;
    if (address.includes(',')) {
        const parts = address.split(',');
        address1 = parts[0].trim();
        address2 = parts.slice(1).join(',').trim();
    } else {
        // Try to parse space-separated format
        const parts = address.split(' ');
        if (parts.length >= 4) {
            // Assume last 2-3 parts are city, state, zip
            const stateZipPattern = /\b[A-Z]{2}\s+\d{5}(-\d{4})?\b$/;
            const match = address.match(stateZipPattern);
            if (match) {
                const splitIndex = address.lastIndexOf(match[0]);
                address1 = address.substring(0, splitIndex).trim();
                // Find the last word before the state abbreviation as city
                const beforeState = address.substring(0, splitIndex).trim();
                const words = beforeState.split(' ');
                const cityStartIndex = beforeState.lastIndexOf(words[words.length - 1]);
                address1 = address.substring(0, cityStartIndex).trim();
                address2 = address.substring(cityStartIndex).trim();
            } else {
                // Fallback: use entire address
                address1 = address;
                address2 = '';
            }
        } else {
            address1 = address;
            address2 = '';
        }
    }
    
    // Build query parameters
    const params = new URLSearchParams({
        address1: address1,
        address2: address2
    });
    
    // Configure HTTPS request options
    const options = {
        hostname: 'api.gateway.attomdata.com',
        port: 443,
        path: `${endpoint}?${params}`,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'apikey': process.env.ATTOM_API_KEY || 'd76915820504e4959c9065b3630f4aa7'
        }
    };
    
    // Make HTTPS request
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const statusCode = res.statusCode;
                const responseHeaders = {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                };
                
                if (statusCode === 200) {
                    try {
                        const parsedData = JSON.parse(data);
                        
                        // Clean response data to remove internal references
                        if (parsedData.status && parsedData.status.attomId) {
                            delete parsedData.status.attomId;
                        }
                        if (parsedData.property && Array.isArray(parsedData.property)) {
                            parsedData.property.forEach(prop => {
                                if (prop.identifier && prop.identifier.attomId) {
                                    prop.identifier.propertyId = prop.identifier.attomId;
                                    delete prop.identifier.attomId;
                                }
                            });
                        }
                        
                        callback(null, {
                            statusCode: 200,
                            headers: responseHeaders,
                            body: JSON.stringify({
                                success: true,
                                data: parsedData,
                                request: {
                                    address: address,
                                    parsedAddress: {
                                        address1: address1,
                                        address2: address2
                                    },
                                    service: 'property-lookup'
                                }
                            })
                        });
                    } catch (parseError) {
                        callback(null, {
                            statusCode: 500,
                            headers: responseHeaders,
                            body: JSON.stringify({
                                success: false,
                                error: 'Failed to parse API response',
                                message: parseError.message
                            })
                        });
                    }
                } else {
                    callback(null, {
                        statusCode: statusCode,
                        headers: responseHeaders,
                        body: JSON.stringify({
                            success: false,
                            error: `API returned status ${statusCode}`,
                            message: data,
                            request: {
                                address: address,
                                service: 'property-lookup'
                            }
                        })
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('Request error:', error);
            callback(null, {
                statusCode: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Request failed',
                    message: error.message
                })
            });
        });
        
        req.end();
    });
};