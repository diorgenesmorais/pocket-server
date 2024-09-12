import fastify from 'fastify'
import z from 'zod'
import { createGoal } from '../functions/create-goal'

const app = fastify()

app.post('/goals', async (request, response) => {
    const createGoalSchema = z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
    })

    const { title, desiredWeeklyFrequency } = createGoalSchema.parse(
        request.body
    )

    const result = await createGoal({ title, desiredWeeklyFrequency })

    response.status(201).send({ ...result })
})

app.listen({
    port: 3000,
}).then(() => {
    console.log('HTTP server running!')
})
