export const DASHBOARD_PERIODS = [
    { label: '7 days', value: '7', days: 7 },
    { label: '30 days', value: '30', days: 30 },
    { label: '90 days', value: '90', days: 90 },
    { label: '365 days', value: '365', days: 365 },
    { label: 'All time', value: 'all', days: null },
]

export function localDateString(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function shiftDate(dateString, amount) {
    const date = new Date(`${dateString}T12:00:00`)
    date.setDate(date.getDate() + amount)
    return localDateString(date)
}

export function formatDate(dateString, options) {
    if (!dateString) return '—'
    return new Date(`${dateString}T12:00:00`).toLocaleDateString(
        'en-GB',
        options || { day: 'numeric', month: 'short' }
    )
}

export function dateRangeForPeriod(periodDays, today = localDateString()) {
    if (!periodDays)
        return { start: null, end: today, previousStart: null, previousEnd: null }
    return {
        start: shiftDate(today, -(periodDays - 1)),
        end: today,
        previousStart: shiftDate(today, periodDays * -2 + 1),
        previousEnd: shiftDate(today, -periodDays),
    }
}

export function numericValue(value) {
    if (value === null || value === undefined || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

export function formatNumber(value, digits = 0) {
    if (value === null || value === undefined || !Number.isFinite(Number(value)))
        return '—'
    return Number(value).toLocaleString('en-GB', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

export function average(values) {
    const available = values.map(numericValue).filter((value) => value !== null)
    return available.length ?
        available.reduce((total, value) => total + value, 0) / available.length :
        null
}

export function sum(values) {
    return values
        .map(numericValue)
        .filter((value) => value !== null)
        .reduce((total, value) => total + value, 0)
}

export function percent(numerator, denominator) {
    return denominator ? (numerator / denominator) * 100 : null
}

export function normalizeDailyLog(row) {
    return {
        ...row,
        weight_lb: row.weight_lb ? ? row.weight ? ? null,
        calories_kcal: row.calories_kcal ? ? row.calories ? ? null,
    }
}

export function calculateHabitCompletion(logs, definitions, records) {
    const activeDefinitions = definitions.filter(
        (definition) => definition.active !== false
    )
    const logsById = new Map(logs.map((log) => [log.id, log]))
    const activeHabitIds = new Set(
        activeDefinitions.map((definition) => definition.id)
    )
    const relevantRecords = records.filter(
        (record) =>
        activeHabitIds.has(record.habit_id) &&
        logsById.has(record.daily_log_id) &&
        typeof record.completed === 'boolean'
    )
    const recordsByHabit = new Map()
    for (const record of relevantRecords) {
        const rows = recordsByHabit.get(record.habit_id) || []
        rows.push(record)
        recordsByHabit.set(record.habit_id, rows)
    }

    const perHabit = activeDefinitions.map((definition) => {
        const rows = recordsByHabit.get(definition.id) || []
        const completedDays = rows.filter(
            (record) => record.completed === true
        ).length
        return {
            ...definition,
            completedDays,
            trackedDays: rows.length,
            rate: percent(completedDays, rows.length),
        }
    })

    const byLog = new Map()
    for (const record of relevantRecords) {
        const current = byLog.get(record.daily_log_id) || {
            completed: 0,
            tracked: 0,
        }
        current.tracked += 1
        if (record.completed === true) current.completed += 1
        byLog.set(record.daily_log_id, current)
    }

    const daily = logs.map((log) => {
        const result = byLog.get(log.id) || { completed: 0, tracked: 0 }
        return {
            date: log.log_date,
            logId: log.id,
            ...result,
            rate: percent(result.completed, result.tracked),
        }
    })

    const completedRecords = relevantRecords.filter(
        (record) => record.completed === true
    ).length
    return {
        activeDefinitions,
        relevantRecords,
        perHabit,
        daily,
        completedRecords,
        trackedRecords: relevantRecords.length,
        rate: percent(completedRecords, relevantRecords.length),
    }
}

export function calculateOverview(logs) {
    const valid = (field) => logs.map((log) => log[field])
    return {
        daysTracked: logs.length,
        averageMood: average(valid('mood')),
        averageSleep: average(valid('sleep_hours')),
        averageSteps: average(valid('steps')),
        workouts: logs.filter((log) => log.workout_completed === true).length,
        averageDayRating: average(valid('day_rating')),
        averageEnergy: average(valid('energy')),
        averageStress: average(valid('stress')),
        totalSteps: sum(valid('steps')),
        totalWorkouts: logs.filter((log) => log.workout_completed === true).length,
        averageWorkoutMinutes: average(
            logs
            .filter((log) => log.workout_completed === true)
            .map((log) => log.workout_minutes)
        ),
        averageWater: average(valid('water_litres')),
        averageProtein: average(valid('protein_grams')),
    }
}

export function calculateRollingAverage(logs, field, windowDays = 7) {
    const sorted = [...logs].sort((first, second) =>
        first.log_date.localeCompare(second.log_date)
    )
    const result = []
    let firstInWindow = 0
    let total = 0
    let count = 0

    sorted.forEach((log, index) => {
        const value = numericValue(log[field])
        if (value !== null) {
            total += value
            count += 1
        }
        const firstDate = shiftDate(log.log_date, -(windowDays - 1))
        while (
            firstInWindow <= index &&
            sorted[firstInWindow].log_date < firstDate
        ) {
            const leavingValue = numericValue(sorted[firstInWindow][field])
            if (leavingValue !== null) {
                total -= leavingValue
                count -= 1
            }
            firstInWindow += 1
        }
        result.push({ date: log.log_date, value: count ? total / count : null })
    })

    return result
}

export function calculateWeeklyAverages(logs, fields) {
    const buckets = new Map()

    for (const log of logs) {
        const date = new Date(`${log.log_date}T12:00:00`)
        const weekday = (date.getDay() + 6) % 7
        date.setDate(date.getDate() - weekday)
        const weekStart = localDateString(date)
        const bucket = buckets.get(weekStart) || { log_date: weekStart, values: {} }

        for (const field of fields) {
            bucket.values[field] || = []
            const value = numericValue(log[field])
            if (value !== null) bucket.values[field].push(value)
        }

        buckets.set(weekStart, bucket)
    }

    return [...buckets.values()]
        .sort((first, second) => first.log_date.localeCompare(second.log_date))
        .map((bucket) => ({
            log_date: bucket.log_date,
            ...Object.fromEntries(
                fields.map((field) => [field, average(bucket.values[field] || [])])
            ),
        }))
}

export function calculateWorkoutDistribution(logs) {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const counts = labels.map((label, index) => ({
        label,
        count: 0,
        known: 0,
        index,
    }))
    for (const log of logs) {
        if (typeof log.workout_completed !== 'boolean') continue
        const day = (new Date(`${log.log_date}T12:00:00`).getDay() + 6) % 7
        counts[day].known += 1
        if (log.workout_completed) counts[day].count += 1
    }
    return counts
}

export function calculateWeeklyWorkouts(logs) {
    const weeks = new Map()
    for (const log of logs) {
        if (typeof log.workout_completed !== 'boolean') continue
        const date = new Date(`${log.log_date}T12:00:00`)
        const weekday = (date.getDay() + 6) % 7
        date.setDate(date.getDate() - weekday)
        const key = localDateString(date)
        const week = weeks.get(key) || { start: key, workouts: 0, knownDays: 0 }
        week.knownDays += 1
        if (log.workout_completed) week.workouts += 1
        weeks.set(key, week)
    }
    return [...weeks.values()].sort((a, b) => a.start.localeCompare(b.start))
}

export function calculateRatingDistribution(logs, field = 'mood') {
    const counts = Array.from({ length: 10 }, (_, index) => ({
        rating: index + 1,
        count: 0,
    }))
    for (const log of logs) {
        const value = numericValue(log[field])
        if (value && value >= 1 && value <= 10) counts[value - 1].count += 1
    }
    return counts
}

export function comparePeriods(currentLogs, previousLogs) {
    const current = calculateOverview(currentLogs)
    const previous = calculateOverview(previousLogs)
    const fields = [
        ['Average weight', 'weight_lb', 'average', 'neutral'],
        ['Average steps', 'averageSteps', 'average', 'higher'],
        ['Average sleep', 'averageSleep', 'average', 'higher'],
        ['Average mood', 'averageMood', 'average', 'higher'],
        ['Average energy', 'averageEnergy', 'average', 'higher'],
        ['Average stress', 'averageStress', 'average', 'lower'],
        ['Average day rating', 'averageDayRating', 'average', 'higher'],
        ['Workouts', 'workouts', 'total', 'higher'],
    ]
    return fields.map(([label, field, method, direction]) => {
        const currentValue =
            field === 'weight_lb' ?
            average(currentLogs.map((log) => log.weight_lb)) :
            field === 'workouts' ?
            currentLogs.some(
                (log) => typeof log.workout_completed === 'boolean'
            ) ?
            current.workouts :
            null :
            current[field]
        const previousValue =
            field === 'weight_lb' ?
            average(previousLogs.map((log) => log.weight_lb)) :
            field === 'workouts' ?
            previousLogs.some(
                (log) => typeof log.workout_completed === 'boolean'
            ) ?
            previous.workouts :
            null :
            previous[field]
        const difference =
            currentValue === null || previousValue === null ?
            null :
            currentValue - previousValue
        const changePercent =
            method === 'average' && previousValue ?
            (difference / Math.abs(previousValue)) * 100 :
            null
        let sentiment = 'neutral'
        if (difference !== null && direction !== 'neutral') {
            const improved = direction === 'higher' ? difference > 0 : difference < 0
            sentiment =
                difference === 0 ? 'neutral' : improved ? 'positive' : 'negative'
        }
        return {
            label,
            current: currentValue,
            previous: previousValue,
            difference,
            changePercent,
            sentiment,
        }
    })
}

export function compareBehaviour(logs, outcomeField, behaviorField, predicate) {
    const known = logs.filter(
        (log) => log[behaviorField] !== null && log[behaviorField] !== undefined
    )
    const withBehavior = known.filter((log) => predicate(log[behaviorField], log))
    const withoutBehavior = known.filter(
        (log) => !predicate(log[behaviorField], log)
    )
    const outcome = (rows) => average(rows.map((row) => row[outcomeField]))
    return {
        withBehavior: outcome(withBehavior),
        withoutBehavior: outcome(withoutBehavior),
        withCount: withBehavior.filter(
            (row) => numericValue(row[outcomeField]) !== null
        ).length,
        withoutCount: withoutBehavior.filter(
            (row) => numericValue(row[outcomeField]) !== null
        ).length,
    }
}

export function calculateInsights(
    logs,
    habitSummary,
    expectedDays = logs.length
) {
    const insights = []
    if (!logs.length) return insights
    const loggedRate = percent(logs.length, expectedDays)
    if (loggedRate !== null)
        insights.push(
            `You logged ${Math.round(loggedRate)}% of days in this period (${logs.length} of ${expectedDays}).`
        )
    const bestHabit = [...habitSummary.perHabit]
        .filter((habit) => habit.rate !== null)
        .sort((a, b) => b.rate - a.rate)[0]
    if (bestHabit)
        insights.push(
            `${bestHabit.name} was completed on ${Math.round(bestHabit.rate)}% of days it was recorded.`
        )
    const sleepMood = compareBehaviour(
        logs,
        'mood',
        'sleep_hours',
        (value) => Number(value) >= 7
    )
    if (sleepMood.withCount >= 2 && sleepMood.withoutCount >= 2) {
        const difference = sleepMood.withBehavior - sleepMood.withoutBehavior
        if (Math.abs(difference) >= 0.3) {
            insights.push(
                `Average mood was ${difference > 0 ? 'higher' : 'lower'} on days with 7+ hours of sleep (${sleepMood.withBehavior.toFixed(1)} vs ${sleepMood.withoutBehavior.toFixed(1)}).`
            )
        }
    }
    const workouts = compareBehaviour(
        logs,
        'mood',
        'workout_completed',
        (value) => value === true
    )
    if (workouts.withCount >= 2 && workouts.withoutCount >= 2) {
        const difference = workouts.withBehavior - workouts.withoutBehavior
        if (Math.abs(difference) >= 0.3)
            insights.push(
                `Average mood was ${difference > 0 ? 'higher' : 'lower'} on logged workout days (${workouts.withBehavior.toFixed(1)} vs ${workouts.withoutBehavior.toFixed(1)}).`
            )
    }
    return [...new Set(insights)]
}

export function calculateYearSummary(logs, events, habitSummary) {
    const mostConsistent = [...habitSummary.perHabit]
        .filter((habit) => habit.rate !== null)
        .sort((a, b) => b.rate - a.rate)[0]
    return {
        daysTracked: logs.length,
        totalSteps: sum(logs.map((log) => log.steps)),
        workouts: logs.filter((log) => log.workout_completed === true).length,
        averageSleep: average(logs.map((log) => log.sleep_hours)),
        averageMood: average(logs.map((log) => log.mood)),
        mostConsistent,
        events: events.length,
    }
}