CREATE DATABASE IF NOT EXISTS `sleeved_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sleeved_db`;

-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: sleeved_db
-- ------------------------------------------------------
-- Server version	8.0.42
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

/*!50503 SET NAMES utf8 */;

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;

/*!40103 SET TIME_ZONE='+00:00' */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;

/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Ability`
--
DROP TABLE IF EXISTS `Ability`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Ability` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `text` mediumtext NOT NULL,
    `type` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_ability_name_type` (`name`, `type`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 2499 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Artist`
--
DROP TABLE IF EXISTS `Artist`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Artist` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_artist_name` (`name`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 376 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Attack`
--
DROP TABLE IF EXISTS `Attack`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Attack` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `converted_energy_cost` int NOT NULL,
    `damage` varchar(20) DEFAULT NULL,
    `text` mediumtext,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_name_damage_converted_energy_cost` (`name`, `damage`, `converted_energy_cost`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 14766 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card`
--
DROP TABLE IF EXISTS `Card`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card` (
    `id` varchar(100) NOT NULL,
    `name` varchar(255) NOT NULL,
    `supertype` varchar(100) NOT NULL,
    `level` varchar(20) DEFAULT NULL,
    `hp` varchar(20) DEFAULT NULL,
    `evolves_from` varchar(255) DEFAULT NULL,
    `evolves_to` varchar(255) DEFAULT NULL,
    `converted_retreat_cost` int NOT NULL,
    `number` varchar(20) NOT NULL,
    `image_large` mediumtext NOT NULL,
    `image_small` mediumtext NOT NULL,
    `flavor_text` mediumtext,
    `national_pokedex_numbers` varchar(20) DEFAULT NULL,
    `artist_id` int NOT NULL,
    `rarity_id` int NOT NULL,
    `set_id` varchar(255) NOT NULL,
    `legality_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_card_artist_id` (`artist_id`),
    KEY `idx_card_rarity_id` (`rarity_id`),
    KEY `idx_card_legality_id` (`legality_id`),
    KEY `idx_card_set_id` (`set_id`),
    CONSTRAINT `fk_card_artist_id` FOREIGN KEY (`artist_id`) REFERENCES `Artist` (`id`),
    CONSTRAINT `fk_card_legality_id` FOREIGN KEY (`legality_id`) REFERENCES `Legalities` (`id`),
    CONSTRAINT `fk_card_rarity_id` FOREIGN KEY (`rarity_id`) REFERENCES `Rarity` (`id`),
    CONSTRAINT `fk_card_set_id` FOREIGN KEY (`set_id`) REFERENCES `Set` (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Ability`
--
DROP TABLE IF EXISTS `Card_Ability`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Ability` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(100) NOT NULL,
    `ability_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Ability_index_0` (`card_id`, `ability_id`),
    KEY `fk_card_ability_ability_id_idx` (`ability_id`),
    KEY `fk_card_ability_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_ability_ability_id` FOREIGN KEY (`ability_id`) REFERENCES `Ability` (`id`),
    CONSTRAINT `fk_card_ability_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 3866 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Attack`
--
DROP TABLE IF EXISTS `Card_Attack`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Attack` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(100) NOT NULL,
    `attack_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Attack_index_0` (`card_id`, `attack_id`),
    KEY `fk_card_attack_attack_id_idx` (`attack_id`),
    KEY `fk_card_attack_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_attack_attack_id` FOREIGN KEY (`attack_id`) REFERENCES `Attack` (`id`),
    CONSTRAINT `fk_card_attack_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 26397 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Market_Price`
--
DROP TABLE IF EXISTS `Card_Market_Price`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Market_Price` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `url` mediumtext,
    `average_sell_price` decimal(10, 2) DEFAULT NULL,
    `low_price` decimal(10, 2) DEFAULT NULL,
    `trend_price` decimal(10, 2) DEFAULT NULL,
    `german_pro_low` decimal(10, 2) DEFAULT NULL,
    `suggested_price` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_sell` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_low` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_trend` decimal(10, 2) DEFAULT NULL,
    `low_price_ex_plus` decimal(10, 2) DEFAULT NULL,
    `avg_1` decimal(10, 2) DEFAULT NULL,
    `avg_7` decimal(10, 2) DEFAULT NULL,
    `avg_30` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_avg_1` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_avg_7` decimal(10, 2) DEFAULT NULL,
    `reverse_holo_avg_30` decimal(10, 2) DEFAULT NULL,
    `card_id` varchar(255) NOT NULL,
    `updated_at` date NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_card_market_price_card_id_updated_at` (`card_id`, `updated_at`),
    KEY `fk_card_market_price_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_market_price_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1234586633 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Resistance`
--
DROP TABLE IF EXISTS `Card_Resistance`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Resistance` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(255) NOT NULL,
    `resistance_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Resistance_index_0` (`card_id`, `resistance_id`),
    KEY `fk_card_resistance_resistance_id_idx` (`resistance_id`),
    KEY `fk_card_resistance_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_resistance_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`),
    CONSTRAINT `fk_card_resistance_resistance_id` FOREIGN KEY (`resistance_id`) REFERENCES `Resistance` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 4689 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Subtype`
--
DROP TABLE IF EXISTS `Card_Subtype`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Subtype` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(100) NOT NULL,
    `subtype_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Subtype_index_0` (`card_id`, `subtype_id`),
    KEY `fk_card_subtype_subtype_id_idx` (`subtype_id`),
    CONSTRAINT `fk_card_subtype_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`),
    CONSTRAINT `fk_card_subtype_subtype_id` FOREIGN KEY (`subtype_id`) REFERENCES `Subtype` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 22627 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Type`
--
DROP TABLE IF EXISTS `Card_Type`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Type` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(100) NOT NULL,
    `type_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Type_index_0` (`card_id`, `type_id`),
    KEY `fk_card_type_type_id_idx` (`type_id`),
    KEY `fk_card_type_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_type_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`),
    CONSTRAINT `fk_card_type_type_id` FOREIGN KEY (`type_id`) REFERENCES `Type` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 16285 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Card_Weakness`
--
DROP TABLE IF EXISTS `Card_Weakness`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Card_Weakness` (
    `id` int NOT NULL AUTO_INCREMENT,
    `card_id` varchar(255) NOT NULL,
    `weakness_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `Card_Weakness_index_0` (`card_id`, `weakness_id`),
    KEY `fk_card_weakness_weakness_id_idx` (`weakness_id`),
    KEY `fk_card_weakness_card_id_idx` (`card_id`),
    CONSTRAINT `fk_card_weakness_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`),
    CONSTRAINT `fk_card_weakness_weakness_id` FOREIGN KEY (`weakness_id`) REFERENCES `Weakness` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 15740 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Cost_Attack`
--
DROP TABLE IF EXISTS `Cost_Attack`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Cost_Attack` (
    `id` int NOT NULL AUTO_INCREMENT,
    `type_id` int DEFAULT NULL,
    `attack_id` int NOT NULL,
    `cost` int NOT NULL,
    `is_free` tinyint NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_cost_attack_attack_id` (`attack_id`),
    KEY `idx_cost_attack_type_id` (`type_id`),
    CONSTRAINT `fk_cost_attack_attack_id` FOREIGN KEY (`attack_id`) REFERENCES `Attack` (`id`),
    CONSTRAINT `fk_cost_attack_type_id` FOREIGN KEY (`type_id`) REFERENCES `Type` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 23587 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Legalities`
--
DROP TABLE IF EXISTS `Legalities`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Legalities` (
    `id` int NOT NULL AUTO_INCREMENT,
    `standard` varchar(100) DEFAULT NULL,
    `expanded` varchar(100) DEFAULT NULL,
    `unlimited` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_legalities_standard_expanded_unlimited` (`standard`, `expanded`, `unlimited`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Rarity`
--
DROP TABLE IF EXISTS `Rarity`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Rarity` (
    `id` int NOT NULL AUTO_INCREMENT,
    `label` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_rarity_label` (`label`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 42 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Resistance`
--
DROP TABLE IF EXISTS `Resistance`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Resistance` (
    `id` int NOT NULL AUTO_INCREMENT,
    `type_id` int NOT NULL,
    `value` varchar(20) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_resistance_type_id` (`type_id`),
    CONSTRAINT `fk_resistance_type_id` FOREIGN KEY (`type_id`) REFERENCES `Type` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 17 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Set`
--
DROP TABLE IF EXISTS `Set`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Set` (
    `id` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `series` varchar(255) NOT NULL,
    `printed_total` int NOT NULL,
    `total` int NOT NULL,
    `ptcgo_code` varchar(100) DEFAULT NULL,
    `release_date` date NOT NULL,
    `updated_at` timestamp NOT NULL,
    `image_symbol` mediumtext NOT NULL,
    `image_logo` mediumtext NOT NULL,
    `legality_id` int NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `idx_set_legality_id` (`legality_id`),
    CONSTRAINT `fk_set_legality_id` FOREIGN KEY (`legality_id`) REFERENCES `Legalities` (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Subtype`
--
DROP TABLE IF EXISTS `Subtype`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Subtype` (
    `id` int NOT NULL AUTO_INCREMENT,
    `label` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_subtype_label` (`label`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 41 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tcg_Player_Price`
--
DROP TABLE IF EXISTS `Tcg_Player_Price`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Tcg_Player_Price` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `type` varchar(100) NOT NULL COMMENT 'normal, holofoil, reverseHolofoil, 1stEditionHolofoil and 1stEditionNormal.',
    `low` decimal(10, 2) DEFAULT NULL,
    `mid` decimal(10, 2) DEFAULT NULL,
    `high` decimal(10, 2) DEFAULT NULL,
    `market` decimal(10, 2) DEFAULT NULL,
    `direct_low` decimal(10, 2) DEFAULT NULL,
    `tcg_player_reporting_id` bigint NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_tcg_player_price_type_tcg_player_reporting_id` (`type`, `tcg_player_reporting_id`),
    KEY `fk_tcg_player_type_price_tcg_player_reporting_id` (`tcg_player_reporting_id`),
    CONSTRAINT `fk_tcg_player_type_price_tcg_player_reporting_id` FOREIGN KEY (`tcg_player_reporting_id`) REFERENCES `Tcg_Player_Reporting` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1234599725 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tcg_Player_Reporting`
--
DROP TABLE IF EXISTS `Tcg_Player_Reporting`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Tcg_Player_Reporting` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `url` mediumtext,
    `updated_at` date NOT NULL,
    `card_id` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_tcg_player_reporting_updated_at_card_id` (`updated_at`, `card_id`),
    KEY `fk_tcg_player_reporting_card_id` (`card_id`),
    CONSTRAINT `fk_tcg_player_reporting_card_id` FOREIGN KEY (`card_id`) REFERENCES `Card` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1234586734 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Type`
--
DROP TABLE IF EXISTS `Type`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Type` (
    `id` int NOT NULL AUTO_INCREMENT,
    `label` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    UNIQUE KEY `uk_type_label` (`label`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Weakness`
--
DROP TABLE IF EXISTS `Weakness`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE
  `Weakness` (
    `id` int NOT NULL AUTO_INCREMENT,
    `type_id` int NOT NULL,
    `value` varchar(20) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `id` (`id`),
    KEY `fk_weakness_type_id_idx` (`type_id`),
    CONSTRAINT `fk_weakness_type_id` FOREIGN KEY (`type_id`) REFERENCES `Type` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 43 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;

/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;

/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-26 16:12:29