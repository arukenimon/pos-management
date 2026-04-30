<?php
$cookieFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'pos_cookies.txt';

// Step 1: Load login page to get session & CSRF token
$ch = curl_init('http://127.0.0.1:8000/login');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_COOKIEJAR => $cookieFile,
    CURLOPT_COOKIEFILE => $cookieFile,
]);
$resp = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);
echo "Login page GET: {$info['http_code']}" . PHP_EOL;

// Extract XSRF token from cookie jar
$cookieContent = file_exists($cookieFile) ? file_get_contents($cookieFile) : '';
preg_match('/XSRF-TOKEN\s+([^\s\r\n]+)/', $cookieContent, $x);
$xsrfToken = isset($x[1]) ? urldecode($x[1]) : '';
echo "XSRF: " . (empty($xsrfToken) ? "MISSING" : substr($xsrfToken, 0, 30) . "...") . PHP_EOL;

// Step 2: POST login
$ch = curl_init('http://127.0.0.1:8000/login');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_POST => true,
    CURLOPT_COOKIEJAR => $cookieFile,
    CURLOPT_COOKIEFILE => $cookieFile,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]),
    CURLOPT_HTTPHEADER => [
        'X-XSRF-TOKEN: ' . $xsrfToken,
        'Content-Type: application/x-www-form-urlencoded',
        'X-Inertia: true',
        'X-Inertia-Version: 1',
        'Accept: application/json',
    ],
]);
$loginResp = curl_exec($ch);
$loginInfo = curl_getinfo($ch);
curl_close($ch);
echo "Login POST (final after redirects): {$loginInfo['http_code']}" . PHP_EOL;

// Step 3: Access show route as Inertia XHR
$ch = curl_init('http://127.0.0.1:8000/default/sales/19');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_COOKIEJAR => $cookieFile,
    CURLOPT_COOKIEFILE => $cookieFile,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_HTTPHEADER => [
        'X-Inertia: true',
        'X-Inertia-Version: test-stale-version',
        'Accept: application/json, text/plain, */*',
        'X-Requested-With: XMLHttpRequest',
    ],
]);
$showResp = curl_exec($ch);
$showInfo = curl_getinfo($ch);
curl_close($ch);

echo PHP_EOL . "=== Show route (authenticated Inertia XHR) ===" . PHP_EOL;
echo "Status: {$showInfo['http_code']}" . PHP_EOL;
$headers = substr($showResp, 0, $showInfo['header_size']);
foreach (explode("\n", $headers) as $h) {
    $h = trim($h);
    if (preg_match('/^(HTTP|X-Inertia|Location|Content-Type)/i', $h)) echo $h . PHP_EOL;
}
$body = substr($showResp, $showInfo['header_size']);
echo "Body (first 300): " . substr($body, 0, 300) . PHP_EOL;

@unlink($cookieFile);
