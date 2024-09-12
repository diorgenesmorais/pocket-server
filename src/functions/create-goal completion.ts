import dayjs from 'dayjs'
import { db } from '../db'
import { goals, goalCompletions } from '../db/schema'
import { count, and, gte, lte, eq, sql } from 'drizzle-orm'

interface ICreateGoalCompletionRequest {
    goalId: string
}

export async function createGoalCompletion({
    goalId,
}: ICreateGoalCompletionRequest) {
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db
            .select({
                goalId: goalCompletions.goalId,
                completionCount: count(goalCompletions.id).as(
                    'completionCount'
                ),
            })
            .from(goalCompletions)
            .where(
                and(
                    gte(goalCompletions.createdAt, firstDayOfWeek),
                    lte(goalCompletions.createdAt, lastDayOfWeek),
                    eq(goalCompletions.goalId, goalId)
                )
            )
            .groupBy(goalCompletions.goalId)
    )

    const result = await db
        .with(goalCompletionCounts)
        .select({
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            completionCount:
                sql`COALESCE(${goalCompletionCounts.completionCount}, 0)`.mapWith(
                    Number
                ),
        })
        .from(goals)
        .leftJoin(
            goalCompletionCounts,
            eq(goalCompletionCounts.goalId, goals.id)
        )
        .where(eq(goals.id, goalId))

    const { completionCount, desiredWeeklyFrequency } = result[0]

    if (completionCount >= desiredWeeklyFrequency) {
        throw new Error('Você já completou a meta')
    }

    const resultCompletion = await db
        .insert(goalCompletions)
        .values({
            goalId,
        })
        .returning()

    const goalCompletion = resultCompletion[0]

    return {
        goalCompletion,
    }
}
