var path = require('path');

module.exports = {
  up: function(migration, DataTypes, done) {
    require('../api/ORM/migration/AllModels')(migration, DataTypes, path.resolve('models'));

    done();
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropAllTables()
      .complete(done)
    ;
  }
};
