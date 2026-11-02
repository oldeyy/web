-- Схема базы данных сайта «Все счётчики» (общая для публичной части и админ-панели)
-- MySQL 8 / MariaDB 10.5+

CREATE DATABASE IF NOT EXISTS meters CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meters;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS revoked_tokens, notifications, receipts, readings, tariffs, meters, users;
SET FOREIGN_KEY_CHECKS = 1;

-- Пользователи: абоненты и сотрудники. Вход по номеру телефона (хранится как 7XXXXXXXXXX)
CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account       VARCHAR(20)  NULL UNIQUE COMMENT 'лицевой счёт (только у абонентов)',
    address       VARCHAR(255) NULL,
    role          ENUM('admin', 'operator', 'abonent') NOT NULL DEFAULT 'abonent',
    status        ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Приборы учёта
CREATE TABLE meters (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    number         VARCHAR(20) NOT NULL UNIQUE COMMENT 'заводской номер',
    resource       ENUM('electricity', 'water', 'gas') NOT NULL,
    user_id        INT UNSIGNED NOT NULL,
    installed_at   DATE NOT NULL,
    verified_until DATE NOT NULL COMMENT 'срок действия поверки',
    status         ENUM('active', 'verification', 'disabled') NOT NULL DEFAULT 'active',
    CONSTRAINT fk_meters_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_meters_verified (verified_until)
) ENGINE=InnoDB;

-- Тарифы: valid_to = NULL — действующий тариф
CREATE TABLE tariffs (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resource   ENUM('electricity', 'water', 'gas') NOT NULL,
    name       VARCHAR(150) NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    unit       VARCHAR(10) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to   DATE NULL
) ENGINE=InnoDB;

-- Показания счётчиков (передаются абонентами через input.html или вносятся оператором)
CREATE TABLE readings (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meter_id      INT UNSIGNED NOT NULL,
    reading_date  DATE NOT NULL,
    prev_value    DECIMAL(12, 3) NOT NULL,
    current_value DECIMAL(12, 3) NOT NULL,
    tariff        DECIMAL(10, 2) NOT NULL COMMENT 'тариф на момент передачи',
    responsible   VARCHAR(150) NOT NULL COMMENT 'ответственный за снятие',
    status        ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    comment       VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'причина отклонения',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_readings_meter FOREIGN KEY (meter_id) REFERENCES meters (id) ON DELETE RESTRICT,
    CONSTRAINT chk_readings_values CHECK (current_value >= prev_value),
    INDEX idx_readings_date (reading_date),
    INDEX idx_readings_status (status)
) ENGINE=InnoDB;

-- Квитанции за расчётный период
CREATE TABLE receipts (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id   INT UNSIGNED NOT NULL,
    period    CHAR(7) NOT NULL COMMENT 'ГГГГ-ММ',
    amount    DECIMAL(12, 2) NOT NULL,
    status    ENUM('paid', 'unpaid', 'overdue') NOT NULL DEFAULT 'unpaid',
    issued_at DATE NOT NULL,
    CONSTRAINT fk_receipts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    UNIQUE KEY uq_receipts_user_period (user_id, period)
) ENGINE=InnoDB;

-- Уведомления: user_id = NULL — рассылка всем абонентам
CREATE TABLE notifications (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id   INT UNSIGNED NULL,
    message   TEXT NOT NULL,
    sender_id INT UNSIGNED NULL,
    sent_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Отозванные JWT (выход из системы до истечения срока токена)
CREATE TABLE revoked_tokens (
    jti        CHAR(32) PRIMARY KEY,
    expires_at DATETIME NOT NULL
) ENGINE=InnoDB;
