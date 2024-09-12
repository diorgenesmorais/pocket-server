import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../../functions/create-goal completion'

const completionValidator = {
    schema: {
        body: z.object({
            goalId: z.string(),
        }),
    },
}

export const completionsRoute: FastifyPluginAsyncZod = async app => {
    app.post('/completions', completionValidator, async (request, response) => {
        try {
            const { goalId } = request.body

            const result = await createGoalCompletion({ goalId })

            response.status(201).send({ ...result })
        } catch (error) {
            response.status(400).send(error)
        }
    })
}
