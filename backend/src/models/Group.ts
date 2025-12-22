import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Group extends Model {
  declare id: number;
  declare name: string;
  declare userId: number;
}

Group.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize, modelName: 'group' });