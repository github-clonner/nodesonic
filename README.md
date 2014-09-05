nodesonic
=========

#### + config ####
/config/config.json
fichier utilise par sequelize.

#### + database ####
> sudo mysql

CREATE USER 'nodesonic'@'localhost' IDENTIFIED BY 'nodesonic';
CREATE DATABASE nodesonic;
GRANT ALL ON nodesonic.* TO 'nodesonic'@'localhost';


> mysql -u nodesonic -p

USE nodesonic;

#### + database migration|install ####
> node_modules/.bin/sequelize
> node_modules/.bin/sequelize db:migrate
> node_modules/.bin/sequelize db:migrate:undo

#### + launch server ####

node kernel.js | node_modules/.bin/bunyan

#### + generate doc ####
> grunt jsdoc
