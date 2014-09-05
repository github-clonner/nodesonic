/** @class Album */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Album', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      id_artist: DataTypes.INTEGER,
      name: DataTypes.STRING
    }, {
      tableName: 'album',
      timestamps: false,
      underscored: true,
      classMethods: {
        associate: function(models) {
          this.hasMany(models.Music, { as: 'Tracks', foreignKey: 'id_album' });
          this.belongsTo(models.Artist, { as: 'Artist' });
           // associations can be defined here
        }
      }
    }
  );
};
