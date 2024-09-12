import fastify from 'fastify'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal.route'
import { getPendingGoalsRoute } from './routes/get-pending-goals.route'
import { completionsRoute } from './routes/completions.route'
import { getWeekSummaryRoute } from './routes/get-week-summary.route'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoalRoute)
app.register(getPendingGoalsRoute)
app.register(completionsRoute)
app.register(getWeekSummaryRoute)

app.listen({
    port: 3000,
}).then(() => {
    console.log('HTTP server running!')
})
