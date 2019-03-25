'use strict';
module.exports = (sequelize, DataTypes) => {
  const Region = sequelize.define('Region', {
    region_name: DataTypes.STRING(64),
    region_code: DataTypes.STRING
  }, {paranoid: true, timeStamps: true});
  Region.associate = function(models) {
    Region.hasMany(models.Province, {
      foreignKey: 'regionId'
    });
  };
  return Region;
};