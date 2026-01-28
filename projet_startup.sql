-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 28 jan. 2026 à 09:24
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Désactiver temporairement les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `projet_startup`
--

-- --------------------------------------------------------

--
-- Structure de la table `bibliothequepersonnelle`
--

DROP TABLE IF EXISTS `bibliothequepersonnelle`;
CREATE TABLE IF NOT EXISTS `bibliothequepersonnelle` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Authors` json DEFAULT NULL,
  `CoverUrl` varchar(512) DEFAULT NULL,
  `InfoLink` varchar(512) DEFAULT NULL,
  `Description` varchar(2000) DEFAULT NULL,
  `Source` varchar(50) NOT NULL DEFAULT 'google_books',
  `SourceID` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `idx_biblio_user` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `emprunt`
--

DROP TABLE IF EXISTS `emprunt`;
CREATE TABLE IF NOT EXISTS `emprunt` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `IDUser1` int NOT NULL,
  `IDUser2` int NOT NULL,
  `IDLivre` int NOT NULL,
  `DateTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_emprunt_user1` (`IDUser1`),
  KEY `fk_emprunt_user2` (`IDUser2`),
  KEY `fk_emprunt_livre` (`IDLivre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `livre`
--

DROP TABLE IF EXISTS `livre`;
CREATE TABLE IF NOT EXISTS `livre` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Auteur` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Genre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Surname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Villes` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MDP` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Age` int DEFAULT NULL,
  `Signalement` int DEFAULT '0',
  `liste_livres` json DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `IDEmprunt` int NOT NULL COMMENT 'Référence à l\'emprunt concerné',
  `IDSender` int NOT NULL COMMENT 'ID de l\'utilisateur qui envoie le message',
  `MessageText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsRead` tinyint(1) DEFAULT '0' COMMENT 'Statut de lecture du message',
  PRIMARY KEY (`ID`),
  KEY `fk_message_emprunt` (`IDEmprunt`),
  KEY `fk_message_sender` (`IDSender`),
  KEY `idx_datetime` (`DateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `bibliothequepersonnelle`
--
ALTER TABLE `bibliothequepersonnelle`
  ADD CONSTRAINT `fk_biblio_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`) ON DELETE CASCADE;

--
-- Contraintes pour la table `emprunt`
--
ALTER TABLE `emprunt`
  ADD CONSTRAINT `fk_emprunt_livre` FOREIGN KEY (`IDLivre`) REFERENCES `livre` (`ID`),
  ADD CONSTRAINT `fk_emprunt_user1` FOREIGN KEY (`IDUser1`) REFERENCES `user` (`ID`),
  ADD CONSTRAINT `fk_emprunt_user2` FOREIGN KEY (`IDUser2`) REFERENCES `user` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Contraintes pour la table `message`
ALTER TABLE `message`
  ADD CONSTRAINT `fk_message_emprunt` FOREIGN KEY (`IDEmprunt`) REFERENCES `emprunt` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_message_sender` FOREIGN KEY (`IDSender`) REFERENCES `user` (`ID`) ON DELETE CASCADE;

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;