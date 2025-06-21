// VolumeForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAuth } from '../../../provider/AuthProvider';

const Slider = ({ value, max, onChange, disabled = false, className = '' }) => {
  const trackRef = useRef(null);
  const x = useMotionValue(0);

  // Sync handle position immediately (no spring) to eliminate lag
  useEffect(() => {
    const trackWidth = trackRef.current?.offsetWidth || 0;
    const target = max > 0 ? (value / max) * trackWidth : 0;
    animate(x, target, { type: 'spring', stiffness: 300, damping: 30 });
  }, [value, max, x]);

  const onDrag = (_, info) => {
    if (disabled) return;
    const trackWidth = trackRef.current?.offsetWidth || 1;
    let nextX = info.point.x - trackRef.current.getBoundingClientRect().left;
    nextX = Math.max(0, Math.min(nextX, trackWidth));
    const newValue = Math.round((nextX / trackWidth) * max);
    onChange(newValue);
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-2 rounded-lg ${disabled ? 'bg-gray-400' : 'bg-gray-600'} ${className}`}
      style={{ userSelect: 'none', opacity: disabled ? 0.5 : 1 }}
    >
      <motion.div
        className={`absolute top-0 left-0 h-full rounded-lg ${disabled ? 'bg-gray-400' : 'bg-blue-500'}`}
        style={{ width: x }}
      />
      <motion.div
        className={`absolute w-4 h-4 rounded-full ${disabled ? 'cursor-not-allowed bg-gray-500' : 'cursor-pointer bg-blue-600'}`}
        style={{ x, y: '-50%', top: '50%' }}
        drag={disabled ? false : 'x'}
        dragConstraints={trackRef}
        dragElastic={1}
        onDrag={onDrag}
      />
    </div>
  );
};

const VolumeForm = ({ existingVol, taskId, onCreate, onUpdate, onCancel }) => {
  const { isManager } = useAuth();

  const units = ['m³', 'kg', 'ps'];
  
  const [form, setForm] = useState({
    name: '',
    current_volume: 0,
    whole_volume: 0,
    metrics: units[0],
  });

  useEffect(() => {
    if (existingVol?.id) {
      setForm({
        name: existingVol.name,
        current_volume: existingVol.current_volume,
        whole_volume: existingVol.whole_volume,
        metrics: existingVol.metrics,
      });
    } else {
      setForm({ name: '', current_volume: 0, whole_volume: 0, metrics: units[0] });
    }
  }, [existingVol]);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Блокируем изменение общего объёма для исполнителей
    if (name === 'whole_volume' && !isManager) return;
    
    // Блокируем изменение текущего объёма для менеджеров
    //if (name === 'current_volume' && isManager) return;

    const cleaned = value.replace(/^0+(?!$)/, '');
    
    if (cleaned === '') {
      setForm(prev => ({ ...prev, [name]: '' }));
      return;
    }

    const num = Number(cleaned);

    setForm(prev => {
      if (name === 'whole_volume') {
        const newWhole = clamp(num, 0, Infinity);
        return {
          ...prev,
          whole_volume: newWhole,
          current_volume: clamp(prev.current_volume, 0, newWhole),
        };
      }
      if (name === 'current_volume') {
        return {
          ...prev,
          current_volume: clamp(num, 0, prev.whole_volume),
        };
      }
      return { ...prev, [name]: num };
    });
  };


  const handleSubmit = e => {
    e.preventDefault();
    const payload = { ...form, task_id: taskId };
    existingVol?.id ? onUpdate(existingVol.id, payload) : onCreate(taskId, payload);
  };

  const done = form.whole_volume > 0 && form.current_volume >= form.whole_volume;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold flex items-center">
        {existingVol?.id ? 'Изменить объём' : 'Создать объём'}
        {done && <span className="ml-2 text-green-600">✓</span>}
      </h3>

      <div>
        <label>Volume name</label>
        <input
          name="name"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full p-2 bg-gray-600 rounded outline-none mt-2 ${!isManager ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={!isManager}
          required
        />
      </div>

      {/* Общий объём */}
      <div className="space-y-1">
        <label>Total volume</label>
        <div className="flex items-center gap-2">
        <Slider
          value={form.whole_volume}
          max={50000}
          onChange={v =>
            setForm(prev => ({
              ...prev,
              whole_volume: v,
              current_volume: clamp(prev.current_volume, 0, v),
            }))
          }
          disabled={!isManager}
          className='flex-1'
        />
        <input
          type="number"
          name="whole_volume"
          min={0}
          placeholder="0"
          value={form.whole_volume === 0 ? '' : form.whole_volume}
          onChange={handleNumberChange}
          className="w-24 p-2 border border-gray-600 rounded ml-5 outline-none"
          disabled={!isManager}
        />
        </div>
      </div>

      {/* Текущий объём */}
      <div className="space-y-1">
        <label>Current volume</label>
        <div className="flex items-center gap-2">
          <Slider
            value={form.current_volume}
            max={form.whole_volume}
            onChange={v =>
              setForm(prev => ({
                ...prev,
                current_volume: clamp(v, 0, prev.whole_volume),
              }))
            }
            disabled={form.whole_volume === 0}
            className="flex-1"
          />
          <input
            type="number"
            name="current_volume"
            min={0}
            placeholder="0"
            value={form.current_volume === 0 ? '' : form.current_volume}
            onChange={handleNumberChange}
            disabled={form.whole_volume === 0}
            className="w-24 p-2 border border-gray-600 rounded ml-5 outline-none"
          />
        </div>
      </div>

      <div>
        <label>m.u.</label>
        <select
          name="metrics"
          value={form.metrics}
          onChange={e => setForm(prev => ({ ...prev, metrics: e.target.value }))}
          className={`w-full p-2 bg-gray-600 text-white rounded outline-none mt-2 ${!isManager ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={!isManager}
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-red-400 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {existingVol?.id ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
};

export default VolumeForm;