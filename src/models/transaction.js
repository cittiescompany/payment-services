import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection/index.js';


export default class Transaction extends Model {}
Transaction.init(
  {
    unique_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },

  {
    sequelize,
  }
);