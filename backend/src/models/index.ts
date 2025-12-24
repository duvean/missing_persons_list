import { User } from './User.js';
import { Item } from './Item.js';

// Связи User <-> Item
// У пользователя может быть много товаров
User.hasMany(Item, { 
    foreignKey: 'userId', 
    as: 'items',
    onDelete: 'CASCADE' // Если удалить юзера, удалятся и его сохраненки
});

// Товар принадлежит пользователю
Item.belongsTo(User, { foreignKey: 'userId' });

export { User, Item };