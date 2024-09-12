import fastify from 'fastify'
import z from 'zod'
import { createGoal } from '../functions/create-goal'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../functions/get-week-pending-goals'
import { createGoalCompletion } from '../functions/create-goal completion'

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

const completionValidator = {
    schema: {
        body: z.object({
            goalId: z.string(),
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

app.post('/completions', completionValidator, async (request, response) => {
    try {
        const { goalId } = request.body

        const result = await createGoalCompletion({ goalId })

        response.status(201).send({ ...result })
    } catch (error) {
        response.status(400).send(error)
    }
})

app.listen({
    port: 3000,
}).then(() => {
    console.log('HTTP server running!')
})
