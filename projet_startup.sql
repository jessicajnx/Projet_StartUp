-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 27 jan. 2026 à 14:06
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `projet_startup`
--

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
  UNIQUE KEY `Email` (`Email`)
) ;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`ID`, `Name`, `Surname`, `Role`, `Villes`, `MDP`, `Email`, `Age`, `Signalement`, `liste_livres`) VALUES
(1, 'jessica', 'jaunaux', 'Pauvre', 'Paris', '$2b$12$lzNPSKOTFgxFntpeVjPer.kFtIYmxDLW0CL2retIilUHutEv5i35K', 'jjaunaux@gmail.com', 22, 0, NULL),
(3, 'Admin', 'User', 'Admin', 'Paris', '$2b$12$fC7MERadu4Lsgx8rNa9VpOHH33vkPv7bnIlAajMOt4.M8wlzZyZkW', 'admin@livre2main.fr', 30, 0, NULL);

--
-- Contraintes pour les tables déchargées
--

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
