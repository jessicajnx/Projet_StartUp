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

INSERT INTO `user` (`Name`, `Surname`, `Role`, `Villes`, `MDP`, `Email`, `Age`, `Signalement`, `liste_livres`)
VALUES 
    (
        'Admin',
        'System',
        'Admin',
        'Paris',
        '$2b$12$4Dz5zaIBLmgtQveI/aCkhez7BVj6WB7nFZ41VVJnVC0QOPoB1.uIm',
        'admin@bookshare.com',
        30,
        0,
        NULL
    ),
    (
        'Antoine',
        'Rocq',
        'Pauvre',
        'Paris',
        '$2b$12$yT0j0MEKD3/NFvXUNYxqCOVUqwnL3wuk1duHB03DN50pfiIJPh6kq',
        'arocq@test.com',
        20,
        0,
        NULL
    ),
    (
        'Jess',
        'Jaunaux',
        'Pauvre',
        'Paris',
        '$2b$12$YPEO69dK.ZdgAiDkH1DUTeVlikkHfcYdqn8BsqPfAeRdck.Em4tMC',
        'jess@test.com',
        20,
        0,
        NULL
    ),
    (
        'Jules',
        'Saison',
        'Pauvre',
        'Paris',
        '$2b$12$zE8HKvvNf3oHcX.715Wt2eyKT1qupEeEJGUNask9WI/t5uuHWz8f2',
        'jules@test.com',
        20,
        0,
        NULL
    ),
    (
        'Assistant',
        'Livre2Main',
        'System',
        'Paris',
        '$2b$12$placeholder_hashed_password',
        'assistant@livre2main.com',
        0,
        0,
        NULL
    );

--
-- Déchargement des données de la table `livre`
--

INSERT INTO `livre` (`Nom`, `Auteur`, `Genre`)
VALUES
    ('Proposition d\'échange', 'Système', 'Notification'),
    ('1984', 'George Orwell', 'Science-fiction'),
    ('Le Petit Prince', 'Antoine de Saint-Exupéry', 'Conte'),
    ('Harry Potter à l\'école des sorciers', 'J.K. Rowling', 'Fantasy'),
    ('L\'Étranger', 'Albert Camus', 'Philosophie'),
    ('Le Seigneur des Anneaux', 'J.R.R. Tolkien', 'Fantasy'),
    ('Dune', 'Frank Herbert', 'Science-fiction');

--
-- Déchargement des données de la table `bibliothequepersonnelle`
-- (Les livres personnels des utilisateurs)
--

INSERT INTO `bibliothequepersonnelle` (`UserID`, `Title`, `Authors`, `CoverUrl`, `InfoLink`, `Description`, `Source`, `SourceID`, `CreatedAt`)
VALUES
    -- Livres d'Antoine Rocq (ID: 2)
    (
        2,
        '1984',
        '["George Orwell"]',
        'https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1',
        'https://books.google.com/books?id=kotPYEqx7kMC',
        'Un roman dystopique qui dépeint une société totalitaire où la liberté individuelle est étouffée par un État omniprésent.',
        'google_books',
        'kotPYEqx7kMC',
        NOW()
    ),
    (
        2,
        'Le Petit Prince',
        '["Antoine de Saint-Exupéry"]',
        'https://books.google.com/books/content?id=LrAJAAAAQAAJ&printsec=frontcover&img=1&zoom=1',
        'https://books.google.com/books?id=LrAJAAAAQAAJ',
        'Un conte philosophique et poétique racontant l\'histoire d\'un petit prince venu d\'un astéroïde.',
        'google_books',
        'LrAJAAAAQAAJ',
        NOW()
    ),
    -- Livres de Jess Jaunaux (ID: 3)
    (
        3,
        'Harry Potter à l\'école des sorciers',
        '["J.K. Rowling"]',
        'https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1',
        'https://books.google.com/books?id=wrOQLV6xB-wC',
        'Le premier tome de la saga Harry Potter où un jeune sorcier découvre ses pouvoirs magiques.',
        'google_books',
        'wrOQLV6xB-wC',
        NOW()
    ),
    (
        3,
        'L\'Étranger',
        '["Albert Camus"]',
        'https://books.google.com/books/content?id=WGlXJmr1q0YC&printsec=frontcover&img=1&zoom=1',
        'https://books.google.com/books?id=WGlXJmr1q0YC',
        'Un roman existentialiste racontant l\'histoire de Meursault, un homme détaché de la société.',
        'google_books',
        'WGlXJmr1q0YC',
        NOW()
    ),
    -- Livres de Jules Saison (ID: 4)
    (
        4,
        'Le Seigneur des Anneaux',
        '["J.R.R. Tolkien"]',
        'https://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1',
        'https://books.google.com/books?id=aWZzLPhY4o0C',
        'Une épopée fantasy qui raconte la quête pour détruire un anneau maléfique et sauver la Terre du Milieu.',
        'google_books',
        'aWZzLPhY4o0C',
        NOW()
    );

DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `IDEmprunt` int NOT NULL COMMENT 'Référence à l\'emprunt concerné',
  `IDSender` int NOT NULL COMMENT 'ID de l\'utilisateur qui envoie le message',
  `MessageText` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsRead` tinyint(1) DEFAULT '0' COMMENT 'Statut de lecture du message',
  `MessageMetadata` json DEFAULT NULL COMMENT 'Métadonnées JSON pour actions/propositions',
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