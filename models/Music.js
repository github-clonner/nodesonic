/** @class Music */
//add id_martist ?!
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Music', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      id_album: DataTypes.INTEGER,
      path: DataTypes.STRING,
      title: DataTypes.STRING
    }, {
      tableName: 'music',
      timestamps: false,
      underscored: true,
      classMethods: {
        associate: function(models) {
          this.belongsTo(models.Album, { as: 'Album' });
           // associations can be defined here
        }
      }
    }
  );
};
