import fastify from 'fastify'
import z from 'zod'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { getWeekPendingGoals } from '../functions/get-week-pending-goals'
import { createGoalCompletion } from '../functions/create-goal completion'
import { createGoalRoute } from './routes/create-goal.route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)

const completionValidator = {
    schema: {
        body: z.object({
            goalId: z.string(),
        }),
    },
}

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
