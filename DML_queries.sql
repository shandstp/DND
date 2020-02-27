-- The following commands are the skeleton code for what our project will need to implement.
-- a * will indicate that the variable listed will be an input from the user, this input is NOT nullable
-- a $ will indicate that the variable listed is a nullable input from the user.

-- seaching for a human based on first and last name.
SELECT firstName, lastName, playableChar, gameID, class, spouseID, hitpointVal FROM Humanoids WHERE firstname=*firstName AND lastname=*lastName;

-- selecting a DM and viewing the games they have abaliable with the amount of people in each one.
SELECT DungeonMasters.firstName, DungeonMasters.lastName, DungeonMasters.experience, DungeonMasters.email, Games.playerNum From DungeonMasters JOIN Games ON Games.DungeonMaster=DungeonMasters.DMID WHERE DungeonMasters.firstName=*firstName AND DungeonMasters.lastName=*lastName;

-- Selecting humans based off the game name.
SELECT Humanoids.firstName Humanoids.lastName, Humanoids.class, Humanoids.playableChar FROM Humanoids JOIN Games ON Games.GameID=Humanoids.GameID WHERE Games.name=*name;

-- selecting an itrm based off of name
SELECT name, effect, type, cost FROM Items WHERE name=*name;

-- creating a human
INSERT INTO `Humanoids`(`firstName`, `lastName`, `playableChar`, `gameID`, `class`, `spouseID`, `hitpointVal`)
VALUES (*firstName, *lastName, $playableChar, $gameID, $class, $class, $hitpointVal);

-- Inserting into DungeonMasters
INSERT INTO `DungeonMasters`(`firstName`, `lastName`, `experience`, `email`)
VALUES (*firstName, *lastName, $experience, $email);

-- inserting into Items
INSERT INTO `Items`(`name`, `effect`, `type`, `cost`)
VALUES (*name, $effect, *type, $cost);

-- inserting into games
INSERT INTO `Games`(`name`, `dungeonMasterID`, `playerNum`)
VALUES (*name, $DMID, *playerNum);