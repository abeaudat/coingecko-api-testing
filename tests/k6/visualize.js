const fs = require('fs');
const path = require('path');

// Function to parse k6 results
function parseResults(resultsPath) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    return {
        metrics: results.metrics,
        timestamps: results.root_group.groups.map(g => g.timestamp),
        vus: results.metrics.vus.values,
        responseTime: results.metrics.http_req_duration.values,
        errors: results.metrics.errors.values,
    };
}

// Function to generate ASCII chart
function generateASCIIChart(data, width = 50, height = 10) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const chart = Array(height).fill().map(() => Array(width).fill(' '));
    
    data.forEach((value, i) => {
        const x = Math.floor(i * width / data.length);
        const y = Math.floor((value - min) * (height - 1) / range);
        chart[height - 1 - y][x] = '█';
    });
    
    return chart.map(row => row.join('')).join('\n');
}

// Function to generate performance report
function generateReport(results) {
    const report = `
Performance Test Results
=======================

Response Time Distribution
-------------------------
${generateASCIIChart(results.responseTime)}
Min: ${Math.min(...results.responseTime).toFixed(2)}ms
Max: ${Math.max(...results.responseTime).toFixed(2)}ms
Avg: ${(results.responseTime.reduce((a, b) => a + b, 0) / results.responseTime.length).toFixed(2)}ms

Virtual Users
------------
${generateASCIIChart(results.vus)}
Peak VUs: ${Math.max(...results.vus)}

Error Rate
---------
Total Errors: ${results.errors.count}
Error Rate: ${(results.errors.rate * 100).toFixed(2)}%

Summary
-------
Total Requests: ${results.metrics.http_reqs.values.count}
Success Rate: ${((1 - results.errors.rate) * 100).toFixed(2)}%
P90 Response Time: ${results.metrics.http_req_duration.values.p90.toFixed(2)}ms
P95 Response Time: ${results.metrics.http_req_duration.values.p95.toFixed(2)}ms
`;

    return report;
}

// Main execution
if (require.main === module) {
    const resultsPath = process.argv[2] || 'results.json';
    const results = parseResults(resultsPath);
    const report = generateReport(results);
    console.log(report);
    
    // Save report to file
    fs.writeFileSync('performance-report.txt', report);
    console.log('\nReport saved to performance-report.txt');
} 