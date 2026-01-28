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

--
-- Déchargement des données de la table `bibliothequepersonnelle`
--

INSERT INTO `bibliothequepersonnelle` (`ID`, `UserID`, `Title`, `Authors`, `CoverUrl`, `InfoLink`, `Description`, `Source`, `SourceID`, `CreatedAt`) VALUES
(6, 1, 'Les Hauts de Hurle-Vent', '[\"Emily Brontë\"]', 'http://books.google.com/books/content?id=tFE5EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'https://play.google.com/store/books/details?id=tFE5EAAAQBAJ&source=gbs_api', 'Lorsque Mr Earnshaw ramène d’un voyage un enfant abandonné, Heathcliff, les réactions de ses enfants évoquent les orages qui s’abattent sur le domaine des Hauts du Hurlevent. Le fils Hindley n’accepte pas cet enfant sombre et lui fait vivre un enfer. La fille, Catherine, se lie très vite à lui, d’un amour insaisissable et fusionnel. Tous trois grandissent, dans cet amas de sentiments aussi forts qu\'opposés. Heathcliff devient un homme sans scrupule, qui jure de se venger des deux hommes ayant empêché le déploiement de son amour : Hindley, le frère ennemi, et Edgar, le mari de Catherine. La destruction de ces deux familles et de leurs descendances constitue alors son seul objectif. Dans les paysages sauvages et immuables des landes du Yorkshire, les déchirements sont nombreux, et cohabitent dans une passion extrême et des tourments destructeurs...', 'google_books', 'tFE5EAAAQBAJ', '2026-01-27 15:38:37'),
(8, 1, 'Alice au pays des merveilles', '[\"Lewis Carroll\"]', 'http://books.google.com/books/content?id=LoqOAQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'https://play.google.com/store/books/details?id=LoqOAQAAQBAJ&source=gbs_api', 'Un grand classique adapté pour les enfants et magnifiquement illustré. \"Nous sommes tous fous ici. Je suis fou. Vous êtes folle. - Comment savez-vous que je suis folle ? demanda Alice. - Vous devez l\'être, répondit le Chat, ou vous ne seriez pas venue ici.\" Retrouvez les aventures d\'Alice dans ce chef-d\'œuvre de la littérature classique.', 'google_books', 'LoqOAQAAQBAJ', '2026-01-28 08:35:22'),
(9, 1, 'Frankenstein', '[\"Mary Shelley\"]', 'http://books.google.com/books/content?id=N9pcDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'https://play.google.com/store/books/details?id=N9pcDwAAQBAJ&source=gbs_api', '16 juin 1816. L\'orage gronde. Dans une ville cachée au milieu des arbres, sur les bords riants du lac de Genève, une petite société s\'ennuie. Il y a deux poètes, Byron et Shelley, leurs compagnes, Claire et Mary, un médecin, Polidori. On se raconte d\'horribles histoires, selon la mode du temps. On décide même d\'en écrire. Dans la nuit, la jeune Mary – elle n\'a pas encore 19 ans – ne peut dormir : elle rêve d\'un hideux fantasme d\'homme. Quelques jours plus tard naissent Victor Frankenstein et sa créature. Récit d\'une inquiétante nouveauté, vite porté à la scène, très souvent ensuite à l\'écran. Devenu si mythique que, dans l\'esprit du public qui a oublié Mary Shelley, le créateur et sa créature se sont confondus. Traduit de l\'anglais par George Cuvelier et Eugène Rocartel @ Disponible chez 12-21 L\'ÉDITEUR NUMÉRIQUE', 'google_books', 'N9pcDwAAQBAJ', '2026-01-28 08:35:33'),
(10, 1, 'Mansfield Park Illustrated', '[\"Jane Austen\"]', 'http://books.google.com/books/content?id=U2LczQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api', 'http://books.google.fr/books?id=U2LczQEACAAJ&dq=subject:fiction&hl=&as_pt=BOOKS&source=gbs_api', '\"Mansfield Park is the third published novel by Jane Austen, first published in 1814 by Thomas Egerton. A second edition was published in 1816 by John Murray, still within Austen\'s lifetime. The novel did not receive any public reviews until 1821.The novel tells the story of Fanny Price, starting when her overburdened family sends her at age ten to live in the household of her wealthy aunt and uncle and following her development into early adulthood. From early on critical interpretation has been diverse, differing particularly over the character of the heroine, Austen\'s views about theatrical performance and the centrality or otherwise of ordination and religion, and on the question of slavery. Some of these problems have been highlighted in the several later adaptations of the story for stage and screen.\"', 'google_books', 'U2LczQEACAAJ', '2026-01-28 08:54:39');

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
(1, 'chess', 'jaunaux', 'Pauvre', 'Paris', '$2b$12$lzNPSKOTFgxFntpeVjPer.kFtIYmxDLW0CL2retIilUHutEv5i35K', 'jjaunaux@gmail.com', 22, 0, NULL),
(3, 'Admin', 'User', 'Admin', 'Paris', '$2b$12$fC7MERadu4Lsgx8rNa9VpOHH33vkPv7bnIlAajMOt4.M8wlzZyZkW', 'admin@livre2main.fr', 30, 0, NULL),
(4, 'giulian', 'fontaine', 'Pauvre', 'Thiais', '$2b$12$bIcno/AUyxVf4Xp0lwCLVud58DimrSIu4x5DUf1OL09HOBLuqesH2', 'giugiu@free.fr', 12, 0, NULL),
(5, 'giulian', 'lol', 'Pauvre', 'Thiais', '$2b$12$q1B8vQ9CyYObgaQ5KxeU1ONwCglHYv8YpCeV8yP9w4sdogfr9zh2m', 'giugiu1@free.fr', 12, 0, NULL);

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