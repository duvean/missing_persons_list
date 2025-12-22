import { User } from './User.js';
import { Group } from './Group.js';
import { Todo } from './Todo.js';

// Связи User <-> Group
User.hasMany(Group, { foreignKey: 'userId', as: 'groups' });
Group.belongsTo(User, { foreignKey: 'userId' });

// Связи Group <-> Todo
Group.hasMany(Todo, { 
    foreignKey: 'groupId', 
    as: 'todos', 
    onDelete: 'CASCADE' // При удалении группы удалятся и все её задачи
});
Todo.belongsTo(Group, { foreignKey: 'groupId' });

export { User, Group, Todo };