/** @class Artist */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Artist', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      name: {
        unique: true,
        type: DataTypes.STRING
      }
    }, {
      tableName: 'artist',
      timestamps: false,
      underscored: true,
      classMethods: {
        associate: function(models) {
          this.hasMany(models.Album, { as: 'Albums', foreignKey: 'id_artist' });
           // associations can be defined here
        }
      }
    }
  );
};
