import { Info } from 'lucide-react'
import { useId } from 'react'

type InfoTooltipProps = {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const tooltipId = useId()

  return (
    <span className="tooltip">
      <button
        type="button"
        className="tooltip__trigger"
        aria-describedby={tooltipId}
        aria-label={text}
      >
        <Info size={14} />
      </button>
      <span id={tooltipId} role="tooltip" className="tooltip__bubble">
        {text}
      </span>
    </span>
  )
}
