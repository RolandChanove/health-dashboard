// Curated workout programs. Each program can be imported into the user's schedule.
// Exercise weightType mapping:
//   'percent1rm' → percentage of current 1RM (requires liftRef)
//   'bodyweight' → bodyweight
//   'fixed'      → user enters weight; weightLb: 0 means "set your own"

function ex(name, sets, reps, weightType = 'fixed', extra = {}) {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name,
    sets: Array.from({ length: sets }, () => ({
      reps,
      weightType,
      weightLb: extra.weightLb ?? 0,
      percentage: extra.percentage ?? null,
      liftRef: extra.liftRef ?? null,
    })),
    notes: extra.notes ?? '',
  }
}

export const SUGGESTED_PROGRAMS = [
  {
    id: 'summer-2026-powerlifting-cut',
    name: 'Revised 6-Day Powerlifting Cut',
    author: 'Roland J. Chanove',
    tags: ['Powerlifting', 'Cut', '6-Day', 'Big 3'],
    description:
      'Increase bench, squat, and conventional deadlift while cutting. Controls fatigue so you recover between sessions. ' +
      'Priority order: Big 3 strength → hypertrophy/support → traps/neck/abs → optional conditioning.',
    loadingRules: [
      'Most main lift work: RPE 7–8. Keep 1–3 reps in reserve.',
      'Do NOT take OHP, deadlift, squat, or heavy bench to failure during the cut.',
      'Accessory failure is only acceptable on safer movements (curls, lateral raises, calf raises, machine work).',
      'If a session exceeds 85–90 min, cut isolation work first — never rush the main lift.',
      'Week 1 is calibration. Do not chase PRs.',
    ],
    progression: [
      { week: 1, main: 'Calibrate weights at RPE 7–8. No PR chasing.',         accessory: 'Find which accessories fit in 75–90 min.' },
      { week: 2, main: '+5 lb bench if Week 1 moved well. +5–10 lb squat/DL.', accessory: 'Keep same volume. No added work.' },
      { week: 3, main: 'Push slightly heavier, still no grinders.',             accessory: 'Add 1 set to weak points if recovery is good.' },
      { week: 4, main: 'Peak the wave lightly — heavier but controlled.',       accessory: 'Keep accessories moderate.' },
      { week: 5, main: 'Deload: cut main lift volume ~40–50%, lighter loads.',  accessory: 'Cut accessory volume in half.' },
    ],
    days: [
      {
        name: 'Day 1 — Paused Bench + Pull + Traps/Neck',
        focus: 'Paused bench technique · upper back · trap/neck priority',
        dayOfWeek: 4, // Thursday
        exercises: [
          ex('Paused Bench Press',       6, 3,  'percent1rm', { percentage: 72, liftRef: 'bench',    notes: 'Pause at bottom. Fast, clean reps. Do not grind.' }),
          ex('Pull-Ups',                 4, 8,  'bodyweight',                                       { notes: 'Stop 1 rep before failure.' }),
          ex('Unilateral Cable Lat Pull',3, 10, 'fixed',      { notes: 'Full stretch and controlled squeeze. Each side.' }),
          ex('Barbell Row',              3, 8,  'fixed',      { notes: 'Moderate-heavy. Reduced from 4×8 to save recovery.' }),
          ex('Face Pulls',               3, 12, 'fixed',      { notes: 'Moderate. Do not turn into a max-effort lift.' }),
          ex('Rear Delt Flys',           3, 15, 'fixed',      { notes: 'Light-moderate. Strict reps.' }),
          ex('Shrugs',                   4, 10, 'fixed',      { notes: 'Heavy but controlled. Pause briefly at top. Trap priority.' }),
          ex('Preacher Curls',           3, 10, 'fixed',      { notes: 'Moderate. 2 sets if time is tight.' }),
          ex('Hammer Curls',             2, 10, 'fixed',      { notes: 'Grip and brachialis support.' }),
          ex('Reverse Curls',            2, 12, 'fixed',      { notes: 'Light-moderate. Forearms/elbow health.' }),
          ex('Forearm Curls',            2, 15, 'fixed',      { notes: 'Controlled reps.' }),
          ex('Dead Hangs',               2, 1,  'bodyweight', { notes: '30–60 sec each set. Grip, shoulders, decompression.' }),
          ex('Neck Flexion + Extension', 3, 15, 'fixed',      { notes: 'Light. Slow controlled reps. No ego lifting.' }),
        ],
      },
      {
        name: 'Day 2 — Squat Strength + Legs/Core',
        focus: 'Heavy squat · posterior chain · core',
        dayOfWeek: 5, // Friday
        exercises: [
          ex('Back Squat',           4, 5,  'percent1rm', { percentage: 74, liftRef: 'squat', notes: 'RPE 7–8. Keep every rep clean. No grinding.' }),
          ex('RDL',                  3, 6,  'fixed',      { notes: 'Moderate. Reduced from 4×6 to protect deadlift recovery.' }),
          ex('Hack Squat',           3, 8,  'fixed',      { notes: 'Moderate. Deep controlled reps.' }),
          ex('Calf Raises',          4, 12, 'fixed',      { notes: 'Moderate-heavy. Full stretch at bottom.' }),
          ex('Tibialis Raises',      3, 20, 'fixed',      { notes: 'Light-moderate. Control the lowering.' }),
          ex('Hip Adductor Machine', 3, 12, 'fixed',      { notes: 'Moderate. Support squat stability.' }),
          ex('Hip Abductor Machine', 3, 12, 'fixed',      { notes: 'Moderate. Support hip stability.' }),
          ex('Leg Extensions',       2, 12, 'fixed',      { notes: 'Quad accessory. Do not irritate knees.' }),
          ex('Hip Thrusts',          3, 10, 'fixed',      { notes: 'Or Step-Ups — pick one.' }),
          ex('Hanging Leg Raises',   3, 10, 'bodyweight', { notes: 'Abs priority.' }),
          ex('Weighted Crunches',    3, 12, 'fixed',      { notes: 'Moderate-heavy. Brace hard. Do not yank neck.' }),
        ],
      },
      {
        name: 'Day 3 — Bench Volume + Push + Core',
        focus: 'Bench volume · triceps · core · optional sled',
        dayOfWeek: 6, // Saturday
        exercises: [
          ex('Bench Press',                  5, 5,  'percent1rm', { percentage: 73, liftRef: 'bench', notes: '72.5–75%. Keep bar speed good.' }),
          ex('Close-Grip Bench Press',       3, 8,  'fixed',      { notes: 'Triceps. No failure.' }),
          ex('Barbell Overhead Press',       3, 5,  'fixed',      { notes: 'RPE 7–8. Do not grind.' }),
          ex('Chest Flys',                   3, 12, 'fixed',      { notes: 'Light-moderate. Controlled stretch.' }),
          ex('Lu Raises',                    3, 12, 'fixed',      { notes: 'Light. No drop set in first few weeks.' }),
          ex('Overhead Tricep Extension',    3, 10, 'fixed',      { notes: 'Long head triceps.' }),
          ex('Weighted Crunch',              3, 12, 'fixed',      { notes: 'Moderate-heavy. Not failure every set.' }),
          ex('Hollow Body Hold',             3, 1,  'bodyweight', { notes: '30 sec each. Quality position.' }),
          ex('Cable Chops',                  3, 15, 'fixed',      { notes: 'Or Russian Twists. Cable chops transfer better to bracing.' }),
          ex('Sled Pushes (optional)',        4, 1,  'bodyweight', { notes: 'Only if legs feel recovered. 20–40 yd rounds.' }),
        ],
      },
      {
        name: 'Day 4 — Conventional Deadlift + Pull Power + Traps/Neck',
        focus: 'Deadlift priority · upper back power · trap/neck',
        dayOfWeek: 0, // Sunday
        exercises: [
          ex('Conventional Deadlift',       4, 3,  'percent1rm', { percentage: 77, liftRef: 'deadlift', notes: '75–80%. Smooth reps only.' }),
          ex('Halt Deadlift',               2, 3,  'percent1rm', { percentage: 65, liftRef: 'deadlift', notes: '60–70%. Technique only.' }),
          ex('Barbell Row',                 3, 8,  'fixed',      { notes: 'Moderate-heavy. Support deadlift and bench.' }),
          ex('Face Pulls',                  3, 12, 'fixed',      { notes: 'Light-moderate. Shoulder health.' }),
          ex('Rear Delt Flys',              3, 12, 'fixed',      { notes: 'Light-moderate. Upper back/rear delts.' }),
          ex('Heavy Shrugs',               4, 10, 'fixed',      { notes: 'Heavy but strict. Use straps if grip limits traps.' }),
          ex('Bicep Curl to Hammer Curl',   3, 10, 'fixed',      { notes: 'Superset. Do not turn into a 20-minute arm block.' }),
          ex('Reverse Curls',               3, 12, 'fixed',      { notes: 'Light-moderate. Forearms and elbow balance.' }),
          ex('Forearm Curls',               2, 15, 'fixed',      { notes: 'Optional if time is tight.' }),
          ex('Dead Hangs',                  3, 1,  'bodyweight', { notes: '30–60 sec. Grip and shoulder decompression.' }),
          ex('Neck Flexion + Extension',    2, 15, 'fixed',      { notes: 'Light. Controlled neck work.' }),
        ],
      },
      {
        name: 'Day 5 — Bench Intensity + Push + Abs',
        focus: 'Heavy singles · bench intensity · shoulder/tricep · abs',
        dayOfWeek: 1, // Monday
        exercises: [
          ex('Bench Press (Heavy Singles)', 5, 1,  'percent1rm', { percentage: 89, liftRef: 'bench', notes: '88–90%. Singles should be crisp. Changed from 92% for Week 1.' }),
          ex('Bench Back-Off Sets',         3, 4,  'percent1rm', { percentage: 80, liftRef: 'bench', notes: '77.5–82.5%. Use lower end if singles felt slow.' }),
          ex('Close-Grip Bench Press',      2, 7,  'fixed',      { notes: 'Keep elbows/shoulders happy.' }),
          ex('Barbell OHP',                 3, 6,  'fixed',      { notes: 'Not failure.' }),
          ex('Chest Flys',                  2, 12, 'fixed',      { notes: 'Optional if time is tight.' }),
          ex('Lu Raises',                   3, 12, 'fixed',      { notes: 'Strict reps.' }),
          ex('Overhead Tricep Extension',   3, 10, 'fixed',      { notes: 'Triceps without too much joint stress.' }),
          ex('Weighted Crunch',             3, 12, 'fixed',      { notes: 'Abs priority.' }),
          ex('Hollow Body Hold',            3, 1,  'bodyweight', { notes: '30 sec. Ribs down, pelvis tucked.' }),
        ],
      },
      {
        name: 'Day 6 — Squat Volume/Technique + Legs/Stability/Core',
        focus: 'Second squat exposure · lighter than Day 2 · stability',
        dayOfWeek: 2, // Tuesday
        exercises: [
          ex('Paused Squat',          4, 5,  'percent1rm', { percentage: 70, liftRef: 'squat', notes: 'Or Tempo Squat. RPE 6.5–7.5. Lighter than Day 2.' }),
          ex('Bulgarian Split Squat', 3, 8,  'fixed',      { notes: 'Moderate. Controlled reps. Each leg.' }),
          ex('RDLs',                  3, 10, 'fixed',      { notes: 'Moderate.' }),
          ex('Calf Raises',           4, 15, 'fixed',      { notes: 'Moderate-heavy. Full range.' }),
          ex('Tibialis Raises',       3, 20, 'fixed',      { notes: 'Light-moderate. Shin strength/ankle balance.' }),
          ex('Hip Adductor Machine',  3, 12, 'fixed',      { notes: 'Squat stability.' }),
          ex('Hip Abductor Machine',  3, 12, 'fixed',      { notes: 'Hip stability.' }),
          ex('Leg Extensions',        3, 12, 'fixed',      { notes: 'Quad accessory, knee-friendly range.' }),
          ex('Hip Thrusts',           3, 10, 'fixed',      { notes: 'Or Step-Ups — pick one.' }),
          ex('Leg Raises',            3, 12, 'bodyweight', { notes: 'Abs priority.' }),
          ex('Cable Crunch',          3, 12, 'fixed',      { notes: 'Or Weighted Crunch. Brace and control.' }),
        ],
      },
      {
        name: 'Day 7 — Active Recovery + Mobility',
        focus: 'Recover · improve positions · light core/neck only',
        dayOfWeek: 3, // Wednesday — rest
        isRest: true,
        exercises: [
          ex('Yoga / Mobility Flow',   1, 1, 'bodyweight', { notes: '45–60 min. Hip-opening, spinal mobility, hamstrings, ankles, adductors, shoulders.' }),
          ex('Dead Hangs',             2, 1, 'bodyweight', { notes: '30 sec. Easy — do not fatigue grip if hands are beat up.' }),
          ex('Hollow Body Hold',       2, 1, 'bodyweight', { notes: '30 sec. Light core practice.' }),
          ex('Side Bends',             3, 12, 'bodyweight', { notes: 'Oblique/trunk support.' }),
          ex('Light Neck Work',        2, 15, 'fixed',     { notes: 'Low intensity only. Each direction.' }),
          ex('Foam Rolling',           1, 1, 'bodyweight', { notes: '10–15 min. Quads, adductors, glutes, lats, upper back.' }),
        ],
      },
    ],
  },
]
