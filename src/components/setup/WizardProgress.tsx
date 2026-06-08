import { Check } from 'lucide-react'
import { useLanguage } from '../../i18n/useLanguage'

type PrepareStep = 2 | 3 | 4

type WizardProgressProps = {
  step: PrepareStep
}

const STEPS = [1, 2, 3, 4] as const

export function WizardProgress({ step }: WizardProgressProps) {
  const { t } = useLanguage()

  const titles: Record<PrepareStep, string> = {
    2: t.wizardStep2Title,
    3: t.wizardStep3Title,
    4: t.wizardStep4Title,
  }

  return (
    <div className="wizard-progress" aria-label="Progress">
      <ol className="wizard-progress__track">
        {STEPS.map((s, index) => {
          const isDone = s < step || (s === 1 && step > 1)
          const isActive = s === step

          return (
            <li key={s} className="wizard-progress__item">
              {index > 0 && <span className="wizard-progress__line" aria-hidden />}
              <span
                className={`wizard-progress__dot ${isActive ? 'wizard-progress__dot--active' : ''} ${isDone ? 'wizard-progress__dot--done' : ''}`}
              >
                {isDone ? <Check size={12} strokeWidth={2.5} /> : s}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="wizard-progress__title">{titles[step]}</p>
    </div>
  )
}
