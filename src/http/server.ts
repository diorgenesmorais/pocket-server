import fastify from 'fastify'
import z from 'zod'
import { createGoal } from '../functions/create-goal'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../functions/get-week-pending-goals'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const fastifyValidatorWithZod = {
    schema: {
        body: z.object({
            title: z.string(),
            desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
    },
}

app.post('/goals', fastifyValidatorWithZod, async (request, response) => {
    const { title, desiredWeeklyFrequency } = request.body

    const result = await createGoal({ title, desiredWeeklyFrequency })

    response.status(201).send({ ...result })
})

app.get('/pending-goals', async () => {
    const { pendingGoals } = await getWeekPendingGoals()

    return pendingGoals
})

app.listen({
    port: 3000,
}).then(() => {
    console.log('HTTP server running!')
})
