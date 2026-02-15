import { useEffect, useRef, useState } from 'react';

interface YearPickerProps {
  value?: number | null;
  onChange: (year?: number | null) => void;
  years?: number[];
  allowEmpty?: boolean; // show a "Todos" option
  placeholder?: string;
}

export default function YearPicker({ value, onChange, years, allowEmpty = false, placeholder = 'Selecionar' }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const defaultYears = years ?? Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSelect = (y?: number | null) => {
    onChange(y ?? null);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ddd',
          background: '#e9e9ed',
          cursor: 'pointer',
          minWidth: '100px',
          textAlign: 'left',
          color: '#111',
          fontSize: '14px',
          lineHeight: '1.2'
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{value ? String(value) : (allowEmpty ? placeholder : String(defaultYears[0]))}</span>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flex: '0 0 auto', marginLeft: '8px', opacity: 0.9 }}>
            <path d="M5 7l5 5 5-5" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 2000,
            background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '6px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          {allowEmpty && (
            <div
              onClick={() => handleSelect(null)}
              style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              Todos
            </div>
          )}

          {defaultYears.map((y) => (
            <div
              key={y}
              onClick={() => handleSelect(y)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                background: value === y ? 'rgba(74,144,226,0.06)' : 'transparent'
              }}
            >
              {y}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
