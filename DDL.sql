
DROP TABLE IF EXISTS `ItemsHumanoids`;
DROP TABLE IF EXISTS `Items`;
DROP TABLE IF EXISTS `Humanoids`;
DROP TABLE IF EXISTS `Games`;
DROP TABLE IF EXISTS `DungeonMasters`;

CREATE TABLE DungeonMasters
(
  DMID INT AUTO_INCREMENT NOT NULL UNIQUE,
  firstName varchar(255) NOT NULL,
  lastName varchar(255) NOT NULL,
  experience INT,
  email varchar(255),
  PRIMARY KEY(DMID)
);


CREATE TABLE Games
(
  gameID INT AUTO_INCREMENT NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  dungeonMasterID INT NOT NULL,
  playerNum INT NOT NULL,
  FOREIGN KEY (dungeonMasterID) REFERENCES DungeonMasters(DMID),
  PRIMARY KEY(gameID)
);


CREATE TABLE Humanoids
(
  humanoidID INT AUTO_INCREMENT NOT NULL UNIQUE,
  firstName varchar(255) NOT NULL,
  lastName varchar(255) NOT NULL,
  playableChar boolean NOT NULL,
  gameID INT NOT NULL,
  class varchar(255) NOT NULL,
  spouseID INT,
  hitpointVal INT,
  FOREIGN KEY (gameID) REFERENCES Games(gameID),
  FOREIGN KEY (spouseID) REFERENCES Humanoids(humanoidID),
  PRIMARY KEY(humanoidID)
);


CREATE TABLE Items
(
  itemID INT AUTO_INCREMENT NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  effect varchar(255),
  type varchar(255) NOT NULL,
  cost INT,
  PRIMARY KEY(itemID)
);


CREATE TABLE ItemsHumanoids
(
  itemsHumanoidsID INT AUTO_INCREMENT NOT NULL UNIQUE,
  itemID INT NOT NULL,
  humanoidID INT NOT NULL,
  FOREIGN KEY (itemID) REFERENCES Items(itemID) ON DELETE CASCADE,
  FOREIGN KEY (humanoidID) REFERENCES Humanoids(humanoidID) ON DELETE CASCADE,
  PRIMARY KEY (itemsHumanoidsID),
  CONSTRAINT UniqueHumanItem UNIQUE	(itemID, humanoidID)
);


-- Inserting data into the tables.

INSERT INTO `Items`(`name`, `effect`, `type`, `cost`) 
VALUES ('Sword', 'stabbing', 'weapon', 4),
		('Shield', NULL, 'weapon', 1);

INSERT INTO `DungeonMasters`(`firstName`, `lastName`, `experience`, `email`)
VALUES ('Brian', 'Cross', 2, 'hi@gmail.com'),
		('Travis', 'Shands', 3, NULL);

INSERT INTO `Games`(`name`, `dungeonMasterID`, `playerNum`)
VALUES ('Earth', (SELECT DMID FROM DungeonMasters WHERE firstName='Brian'), 3);

INSERT INTO `Humanoids`(`firstName`, `lastName`, `playableChar`, `gameID`, `class`, `spouseID`, `hitpointVal`)
VALUES ('Jekar', 'Aren', TRUE, (SELECT gameID FROM Games WHERE name='Earth'), 'Fighter', NULL, 13);

INSERT INTO `ItemsHumanoids`(`itemID`, `humanoidID`)
VALUES(1, 1);

-- View data for debugging
select * from Humanoids;
select * from Items;
select * from DungeonMasters;
select * from Games;
select * from ItemsHumanoids;