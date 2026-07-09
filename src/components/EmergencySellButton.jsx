import { Siren } from 'lucide-react'

export default function EmergencySellButton({ onClick }) {
  return (
    <button className="emergency-button" onClick={onClick}>
      <Siren size={18} aria-hidden="true" />
      수동 긴급 매도
    </button>
  )
}
