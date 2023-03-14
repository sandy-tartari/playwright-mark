import { test, expect } from '@playwright/test'
import { TaskModel } from './fixtures/task.model';
import { deleteTaskByHelper, postTask } from './support/helpers';
import { TasksPage } from './support/pages/tasks';
import data from './fixtures/tasks.json'

let tasksPage: TasksPage
test.beforeEach(({page}) => {
    tasksPage = new TasksPage(page)
})
test.describe('cadastro', ()=> {
    test('deve poder cadastrar uma nova tarefa', async ({ request }) => {
        const task = data.success as TaskModel
        await deleteTaskByHelper(request, task.name)
        //objeto que representa a propria pagina de tarefa
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.shouldHaveText(task.name)
    });
    test('Não deve permitir tarefa duplicada', async ({ request }) => {
        const task = data.duplicate as TaskModel
        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)
        await request.post('http://localhost:3333/tasks', { data: task })
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.alertHaveText('Task already exists!')
    });
    test('campo obrigatório', async () => {
        const task = data.required as TaskModel
        await tasksPage.go()
        await tasksPage.create(task)
        const validationMessage = await tasksPage.inputTaskName.evaluate(e => (e as HTMLInputElement).validationMessage)
        expect(validationMessage).toEqual('This is a required field')
    });
})

test.describe('Atualizacao', ()=> {
    test('Deve concluir uma tarefa', async ({ request }) => {
        const task = data.update as TaskModel
        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.toggle(task.name)
        await tasksPage.shouldBeDone(task.name)
    });
})
test.describe('Exclusão', ()=> {
    test('Deve concluir uma tarefa', async ({ request }) => {
        const task = data.delete as TaskModel
        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)
        await tasksPage.go()
        await tasksPage.create(task)
        await tasksPage.remove(task.name)
        await tasksPage.shouldNotExist(task.name)
    });
})

    // await inputTaskName.fill(faker.lorem.words()) import { faker } from '@faker-js/faker'
    // await inputTaskName.press('Enter')
    //forma mais elegante: await page.click('css=button >> text=Create')