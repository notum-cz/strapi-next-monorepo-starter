'use client';

import { useState } from 'react';
import { type EnvEntry } from '@/lib/envgen';

interface SecretsTableProps {
  variables: EnvEntry[];
  onUpdate: (variables: EnvEntry[]) => void;
}

export default function SecretsTable({ variables, onUpdate }: SecretsTableProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(variables[index].value);
  };

  const handleSave = (index: number) => {
    const updated = [...variables];
    updated[index].value = editValue;
    onUpdate(updated);
    setEditIndex(null);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditValue('');
  };

  const handleDelete = (index: number) => {
    const updated = variables.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const handleAdd = () => {
    const newVar: EnvEntry = {
      key: 'NEW_VARIABLE',
      value: '',
      comment: 'Custom variable',
    };
    onUpdate([...variables, newVar]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          + Add Variable
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variables.map((variable, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {variable.key}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <span className="font-mono text-gray-600">
                        {variable.value || <em className="text-gray-400">empty</em>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {variable.comment || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    {editIndex === index ? (
                      <>
                        <button
                          onClick={() => handleSave(index)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {variables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No variables yet. Generate from templates or add custom variables.
        </div>
      )}
    </div>
  );
}
