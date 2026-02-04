'use client';

import React from 'react';

export interface ModelParameter {
  name: string;
  type: string;
  description?: string;
  default?: any;
  required?: boolean;
  enum?: any[];
  min?: number;
  max?: number;
}

interface ModelParamsFormProps {
  parameters: ModelParameter[] | string | null | undefined;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  disabled?: boolean;
}

export default function ModelParamsForm({
  parameters,
  values,
  onChange,
  disabled = false,
}: ModelParamsFormProps) {
  // 确保 parameters 是数组
  const paramsArray: ModelParameter[] = React.useMemo(() => {
    if (!parameters) return [];
    if (typeof parameters === 'string') {
      try {
        return JSON.parse(parameters);
      } catch {
        return [];
      }
    }
    return parameters;
  }, [parameters]);

  const handleChange = (name: string, value: any) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  const renderInput = (param: ModelParameter) => {
    const value = values[param.name] ?? param.default;

    switch (param.type) {
      case 'bool':
        return (
          <select
            value={value ?? false}
            onChange={(e) => handleChange(param.name, e.target.value === 'true')}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );

      case 'int':
        if (param.enum) {
          return (
            <select
              value={value ?? param.default ?? ''}
              onChange={(e) => handleChange(param.name, parseInt(e.target.value))}
              disabled={disabled}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {param.enum.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="number"
            min={param.min}
            max={param.max}
            value={value ?? param.default ?? ''}
            onChange={(e) => handleChange(param.name, parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case 'float':
        return (
          <input
            type="number"
            step="0.01"
            min={param.min}
            max={param.max}
            value={value ?? param.default ?? ''}
            onChange={(e) => handleChange(param.name, parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case 'string':
        if (param.enum) {
          return (
            <select
              value={value ?? param.default ?? ''}
              onChange={(e) => handleChange(param.name, e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {param.enum.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value ?? param.default ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case 'list<string>':
        return (
          <input
            type="text"
            value={value ?? param.default ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
            disabled={disabled}
            placeholder="Enter URLs separated by commas"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value ?? param.default ?? ''}
            onChange={(e) => handleChange(param.name, e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );
    }
  };

  // 过滤掉prompt和image参数，这些已经在主界面有了
  const filteredParams = paramsArray.filter(
    (p) => p.name !== 'prompt' && p.name !== 'image' && p.name !== 'image_urls'
  );

  if (filteredParams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Parameter Settings</h3>
      {filteredParams.map((param) => (
        <div key={param.name}>
          <label className="block text-sm font-medium mb-2">
            {param.name}
            {param.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderInput(param)}
          {param.description && (
            <p className="text-xs text-gray-500 mt-1">{param.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
