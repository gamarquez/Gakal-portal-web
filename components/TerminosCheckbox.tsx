interface TerminosCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export default function TerminosCheckbox({ checked, onChange, error }: TerminosCheckboxProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          He leído y acepto los{' '}
          <a
            href="/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            Términos y Condiciones
          </a>{' '}
          y la{' '}
          <a
            href="/privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            Política de Privacidad
          </a>
          . Entiendo que mis datos serán tratados conforme a la Ley 25.326 de Protección de Datos Personales de Argentina.
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600 ml-8">{error}</p>
      )}
    </div>
  )
}
