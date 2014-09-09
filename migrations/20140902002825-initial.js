module.exports = {
  up: function(migration, DataTypes, done) {
    AlbumTable(migration, DataTypes);
    ArtistTable(migration, DataTypes);
    TrackTable(migration, DataTypes);

    done();
  },
  down: function(migration, DataTypes, done) {
    migration
      .dropAllTables()
      .complete(done)
    ;
  }
};


function AlbumTable(migration, DataTypes) {
  migration.createTable('album', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_artist: DataTypes.INTEGER,
    name: DataTypes.STRING,
    path: DataTypes.STRING
  });
}

function ArtistTable(migration, DataTypes) {
  migration.createTable('artist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING
  });
}

function TrackTable(migration, DataTypes) {
  migration.createTable('track', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_album: DataTypes.INTEGER,
    path: DataTypes.STRING,
    title: DataTypes.STRING
  });
}
