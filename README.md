nodesonic
=========

#### config ####
/config/config.json (file used by sequelize).
/config/server.json (default file).
/config/server/{YOUR_USERNAME_IN_ENVIRONNEMENT}.json (default file).

#### database ####
> sudo mysql

> CREATE USER 'nodesonic'@'localhost' IDENTIFIED BY 'nodesonic';

> CREATE DATABASE nodesonic;

> GRANT ALL ON nodesonic.* TO 'nodesonic'@'localhost';

> mysql -u nodesonic -p

> USE nodesonic;

#### database migration|install ####
> node_modules/.bin/sequelize

> node_modules/.bin/sequelize db:migrate

> node_modules/.bin/sequelize db:migrate:undo

#### launch server ####

>node kernel.js | node_modules/.bin/bunyan

#### generate doc ####
> grunt jsdoc
