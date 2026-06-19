import { useProfile } from '../context/ProfileContext.jsx'
import { Card } from './ui/Card.jsx'

// Reference Daily Intake targets (adult). These are read-only guidance values
// shown alongside the actively-tracked macros. Sex-specific where it matters.
const MICROS = (sex) => [
  { name: 'Fiber', male: '38 g', female: '25 g', note: 'Digestive & heart health' },
  { name: 'Sodium', male: '< 2300 mg', female: '< 2300 mg', note: 'Upper limit' },
  { name: 'Potassium', male: '3400 mg', female: '2600 mg', note: 'Blood pressure' },
  { name: 'Calcium', male: '1000 mg', female: '1000 mg', note: 'Bone health' },
  { name: 'Iron', male: '8 mg', female: '18 mg', note: 'Oxygen transport' },
  { name: 'Vitamin D', male: '15 µg', female: '15 µg', note: '600 IU' },
  { name: 'Vitamin C', male: '90 mg', female: '75 mg', note: 'Immune & collagen' },
  { name: 'Magnesium', male: '400 mg', female: '310 mg', note: 'Muscle & nerve' },
]

export function MicronutrientPanel() {
  const { profile } = useProfile()
  const rows = MICROS(profile.sex)

  return (
    <Card
      title="Micronutrient reference"
      subtitle="Recommended daily targets (guidance)"
    >
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2 font-medium">Nutrient</th>
              <th className="px-3 py-2 font-medium">Target</th>
              <th className="hidden px-3 py-2 font-medium sm:table-cell">Why it matters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-slate-50/60">
                <td className="px-3 py-2 font-medium text-slate-700">{r.name}</td>
                <td className="px-3 py-2 tabular-nums text-slate-600">
                  {profile.sex === 'female' ? r.female : r.male}
                </td>
                <td className="hidden px-3 py-2 text-slate-400 sm:table-cell">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Macros (protein / carbs / fat) are actively tracked in the calculator. These micronutrient
        targets are reference values from standard dietary guidelines for a typical adult — consult a
        professional for personalized advice.
      </p>
    </Card>
  )
}
