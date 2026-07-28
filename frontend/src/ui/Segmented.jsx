function Segmented({ options, value, onChange, name }) {
  return (
    <div className="inline-flex rounded-full border border-rule overflow-hidden">
      {options.map((option) => (
        <label
          key={option.value}
          className={`inline-flex items-center px-3 py-[7px] text-[13px] cursor-pointer transition-colors ${
            value === option.value ? 'bg-accent text-page' : 'text-ink hover:bg-ink/7'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

export default Segmented
