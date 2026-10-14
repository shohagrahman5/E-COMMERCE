<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sajabo');
define('DB_USER', 'root');
define('DB_PASSWORD', '');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function send(int $code, $data): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $code, string $message): void {
    send($code, ['error' => $message]);
}

function blank($s): bool {
    return $s === null || trim((string)$s) === '';
}

function hashPass(string $s): string {
    return hash('sha256', $s);
}


function input(string $key, $default = null) {
    if (isset($_POST[$key])) return $_POST[$key];
    if (isset($_GET[$key])) return $_GET[$key];
    return $default;
}


set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => $e->getMessage() ?: 'Server error']);
    exit;
});
