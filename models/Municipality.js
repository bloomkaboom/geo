'use strict';
module.exports = (sequelize, DataTypes) => {
  const Municipality = sequelize.define('Municipality', {
    municipality_name: DataTypes.STRING,
    municipality_code: DataTypes.STRING,
    provinceId: DataTypes.INTEGER
  }, {paranoid: true, timeStamps: true});
  Municipality.associate = function(models) {
    Municipality.belongsTo(models.Province, {
      foreignKey: 'provinceId'
    });
  };
  return Municipality;
};