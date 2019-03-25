'use strict';
module.exports = (sequelize, DataTypes) => {
  const Province = sequelize.define('Province', {
    province_name: DataTypes.STRING(64),
    province_code: DataTypes.STRING,
    regionId: DataTypes.INTEGER
  }, {paranoid: true, timeStamps: true});
  Province.associate = function(models) {
    Province.belongsTo(models.Region, {
      foreignKey: 'regionId'
    });
    Province.hasMany(models.Municipality, {
      foreignKey: 'provinceId'
    });
  };
  return Province;
};