import fastify from 'fastify'
import z from 'zod'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../functions/create-goal completion'
import { createGoalRoute } from './routes/create-goal.route'
import { getPendingGoalsRoute } from './routes/get-pending-goals.route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(getPendingGoalsRoute)

const completionValidator = {
    schema: {
        body: z.object({
            goalId: z.string(),
        }),
    },
}

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
