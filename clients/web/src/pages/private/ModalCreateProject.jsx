import { useState, useContext } from "react";
import { StoreContext } from "../../provider/StoreContext";
import { observer } from "mobx-react-lite";
import { useAuth } from "../../provider/AuthProvider";
import { FiPlus, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const todayDate = new Date().toISOString().split("T")[0];

export const ModalCreateProject = observer(({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { projectStore } = useContext(StoreContext);
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);

  // Step 2
  const [stages, setStages] = useState([{ name: "", start_date: todayDate, end_date: todayDate }]);

  const addStage = () => setStages([...stages, { name: "", start_date: todayDate, end_date: todayDate }]);
  const removeStage = idx => setStages(stages.filter((_, i) => i !== idx));
  const changeStage = (idx, field, v) => {
    const copy = [...stages];
    copy[idx][field] = v;
    setStages(copy);
  };

  const resetAll = () => {
    setStep(1);
    setName(""); setDescription("");
    setStartDate(todayDate); setEndDate(todayDate);
    setStages([{ name: "", start_date: todayDate, end_date: todayDate }]);
    setError("");
  };

  const submit = async e => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) return setError("Project name is required");
      setError(""); return setStep(2);
    }
    setIsLoading(true);
    try {
      const proj = await projectStore.addProject({ name, description, start_date: startDate, end_date: endDate }, user.sub);
      for (const s of stages) {
        if (s.name.trim()) await projectStore.addStage(proj.id, s);
      }
      onClose(); resetAll();
    } catch {
      setError("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 relative text-white"
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          {step === 1 ? "Create Project (Step 1 of 2)" : "Project Stages (Step 2 of 2)"}
        </h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-white/30 flex items-center justify-center rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                Creating...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <label className="flex flex-col">
                  <span className="mb-1">Project Name</span>
                  <input
                    type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
                    placeholder="Enter project name"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Description</span>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
                    rows={3}
                    placeholder="Project description"
                  />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className="mb-1">Start Date</span>
                    <input
                      type="date" value={startDate}
                      min={todayDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1">End Date</span>
                    <input
                      type="date" value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md outline-none"
                      required
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {stages.map((s, i) => (
                <div key={i} className="bg-slate-800 p-4 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeStage(i)}
                    className="absolute top-2 right-2 text-red-400"
                  ><FiX /></button>
                  <h4 className="font-semibold mb-2">Stage {i+1}</h4>
                  <input
                    type="text" value={s.name}
                    onChange={e => changeStage(i, "name", e.target.value)}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-md mb-2 outline-none"
                    placeholder="Stage name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="date" value={s.start_date}
                      onChange={e => changeStage(i, "start_date", e.target.value)}
                      className="bg-slate-700 text-white px-3 py-2 rounded-md outline-none"
                    />
                    <input
                      type="date" value={s.end_date}
                      min={s.start_date}
                      onChange={e => changeStage(i, "end_date", e.target.value)}
                      className="bg-slate-700 text-white px-3 py-2 rounded-md outline-none"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addStage}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                <FiPlus /> Add Stage
              </button>
            </>
          )}

          <div className="flex justify-between mt-4">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Back
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-transparent border border-white/30 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {step === 1 ? "Next" : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
});
