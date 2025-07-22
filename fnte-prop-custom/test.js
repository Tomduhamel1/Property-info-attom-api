// Test the Lambda function locally
const { handler } = require('./index.js');

// Test cases
const testCases = [
    {
        name: "Test with comma-separated address",
        event: {
            body: JSON.stringify({
                address: "120 Fraser Ave, Santa Monica, CA 90405"
            })
        }
    },
    {
        name: "Test with space-separated address",
        event: {
            body: JSON.stringify({
                address: "494 BROADWAY NEWPORT RI 02840"
            })
        }
    },
    {
        name: "Test with custom endpoint",
        event: {
            body: JSON.stringify({
                address: "120 Fraser Ave, Santa Monica, CA 90405",
                endpoint: "/propertyapi/v1.0.0/avm/detail"
            })
        }
    },
    {
        name: "Test with missing address",
        event: {
            body: JSON.stringify({})
        }
    }
];

// Run tests
async function runTests() {
    for (const test of testCases) {
        console.log(`\n--- ${test.name} ---`);
        try {
            await new Promise((resolve) => {
                handler(test.event, {}, (err, response) => {
                    if (err) {
                        console.error('Error:', err);
                    } else {
                        console.log('Status:', response.statusCode);
                        const body = JSON.parse(response.body);
                        console.log('Response:', JSON.stringify(body, null, 2));
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.error('Test failed:', error);
        }
    }
}

// Run if called directly
if (require.main === module) {
    runTests();
}