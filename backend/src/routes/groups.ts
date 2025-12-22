import { Router, Response } from 'express';
import { Group, Todo } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Все роуты ниже требуют авторизации
router.use(authenticateToken);

// 1. Получить все группы текущего пользователя (со всеми задачами)
router.get('/', async (req: any, res: Response) => {
  try {
    const groups = await Group.findAll({
      where: { userId: req.user.userId },
      include: [{ model: Todo, as: 'todos' }],
      order: [['createdAt', 'ASC']]
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// 2. Создать новую группу
router.post('/', async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    const newGroup = await Group.create({
      name,
      userId: req.user.userId
    });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create group' });
  }
});

// 3. Удалить группу
router.delete('/:id', async (req: any, res: Response) => {
  try {
    const result = await Group.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.userId // Проверка владения
      }
    });
    
    if (result) {
      res.json({ message: 'Group deleted' });
    } else {
      res.status(404).json({ error: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// 4. Добавить задачу в конкретную группу
router.post('/:groupId/todos', async (req: any, res: Response) => {
  try {
    const { text } = req.body;
    const { groupId } = req.params;

    // Сначала проверяем, что группа принадлежит пользователю
    const group = await Group.findOne({ 
      where: { id: groupId, userId: req.user.userId } 
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });

    const todo = await Todo.create({
      text,
      groupId: Number(groupId)
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create todo' });
  }
});

// 5. Переключить статус задачи (done/undone)
router.patch('/todos/:id/toggle', async (req: any, res: Response) => {
  try {
    const todo = await Todo.findByPk(req.params.id, {
      include: [{ model: Group, where: { userId: req.user.userId } }]
    });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.done = !todo.done;
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

// 6. Редактировать текст задачи
router.patch('/todos/:id', async (req: any, res: Response) => {
  try {
    const { text } = req.body;
    const todo = await Todo.findByPk(req.params.id, {
      include: [{ model: Group, where: { userId: req.user.userId } }]
    });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.text = text;
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// 7. Удалить задачу
router.delete('/todos/:id', async (req: any, res: Response) => {
  try {
    const todo = await Todo.findByPk(req.params.id, {
      include: [{ model: Group, where: { userId: req.user.userId } }]
    });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    await todo.destroy();
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// 8. Редактировать название группы
router.patch('/:id', async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    const group = await Group.findOne({ 
      where: { id: req.params.id, userId: req.user.userId } 
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });

    group.name = name;
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group name' });
  }
});

export default router;