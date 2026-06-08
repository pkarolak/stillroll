import { Button } from '../ui/Button'

type WizardNavProps = {
  onBack: () => void
  onNext?: () => void
  onSkip?: () => void
  backLabel: string
  nextLabel: string
  skipLabel?: string
  nextDisabled?: boolean
  showSkip?: boolean
  showNext?: boolean
}

export function WizardNav({
  onBack,
  onNext,
  onSkip,
  backLabel,
  nextLabel,
  skipLabel,
  nextDisabled = false,
  showSkip = false,
  showNext = true,
}: WizardNavProps) {
  return (
    <div className="wizard-nav">
      <Button variant="secondary" small onClick={onBack}>
        {backLabel}
      </Button>
      <div className="wizard-nav__right">
        {showSkip && onSkip && skipLabel && (
          <Button variant="secondary" small onClick={onSkip}>
            {skipLabel}
          </Button>
        )}
        {showNext && onNext && (
          <Button
            variant="primary"
            small
            className="wizard-nav__next"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
