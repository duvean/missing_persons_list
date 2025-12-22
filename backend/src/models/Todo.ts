import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Todo extends Model {
  declare id: number;
  declare text: string;
  declare done: boolean;
  declare groupId: number;
}

Todo.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  text: { type: DataTypes.STRING, allowNull: false },
  done: { type: DataTypes.BOOLEAN, defaultValue: false },
  groupId: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize, modelName: 'todo' });