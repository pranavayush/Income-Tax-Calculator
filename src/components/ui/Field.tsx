import React from 'react';
import { useTax } from '../../context/TaxContext';

interface FieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  hint?: string;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
  onInputTransform?: (val: string) => string;
}

export const Field: React.FC<FieldProps> = ({
  label, name, type = 'number', placeholder = '0', min, max, hint, readOnly, maxLength, className = '', onInputTransform
}) => {
  const { values, handleChange } = useTax();
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (onInputTransform) val = onInputTransform(val);
    handleChange(name, val);
  };

  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        maxLength={maxLength}
        value={values[name] !== undefined ? values[name] : (type === 'number' ? '' : '')}
        onChange={onChange}
        readOnly={readOnly}
        style={readOnly ? { background: 'var(--bg2)' } : {}}
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
};

export const SelectField: React.FC<{
  label: string;
  name: string;
  options: { label: string; value: string }[];
  hint?: string;
  optgroups?: { label: string; options: { label: string; value: string }[] }[];
}> = ({ label, name, options, hint, optgroups }) => {
  const { values, handleChange } = useTax();

  return (
    <div className="field">
      <label>{label}</label>
      <select
        id={name}
        name={name}
        value={values[name] || ''}
        onChange={(e) => handleChange(name, e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {optgroups && optgroups.map((og, i) => (
          <optgroup key={i} label={og.label}>
            {og.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
};
