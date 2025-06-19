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
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1 Data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [start_date, setStartDate] = useState(todayDate);
  const [end_date, setEndDate] = useState(todayDate);

  // Step 2 Data
  const [stages, setStages] = useState([{ name: '', start_date: todayDate, end_date: todayDate }]);

  const handleAddStage = () => {
    setStages([...stages, { name: '', start_date: todayDate, end_date: todayDate }]);
  };

  const handleStageChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const handleRemoveStage = (index) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!name.trim()) {
        setError("Название проекта обязательно");
        return;
      }
      setCurrentStep(2);
      setError("");
    } else {
      setIsLoading(true);
      try {
        const newProject = await projectStore.addProject(
          { name, description, start_date, end_date },
          user.sub
        );

        for (const stage of stages) {
          if (stage.name.trim()) {
            await projectStore.addStage(newProject.id, stage);
          }
        }

        onClose();
        resetForm();
      } catch (error) {
        console.error("Ошибка создания проекта:", error);
        setError("Ошибка при создании проекта");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setDescription("");
    setStages([{ name: '', start_date: todayDate, end_date: todayDate }]);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-base-content text-base-100 w-full max-w-3xl border border-base-300 rounded-2xl shadow-2xl p-8 relative">

        <h2 className="text-3xl font-bold text-center mb-6">
          {currentStep === 1 ? 'Создание проекта — шаг 1 из 2' : 'Этапы проекта — шаг 2 из 2'}
        </h2>

        {error && <div className="text-error mb-4 text-center">{error}</div>}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base-content/80 flex items-center justify-center rounded-2xl z-10"
            >
              <motion.div
                className="px-6 py-4 bg-primary text-base-100 rounded-lg shadow-xl text-xl font-semibold"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                Создание проекта...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col text-lg">
                <span className="ml-1">Название проекта:</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered border-base-300  bg-base-content mt-1"
                  required
                />
              </label>

              <label className="flex flex-col text-lg">
                <span className="ml-1">Описание:</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full textarea textarea-bordered border-base-300 bg-base-content mt-1"
                  rows={4}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col text-lg">
                  <span className="ml-1">Дата начала:</span>
                  <input
                    type="date"
                    value={start_date}
                    min={todayDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input input-bordered border-base-300  bg-base-content mt-1"
                  />
                </label>

                <label className="flex flex-col text-lg">
                  <span className="ml-1">Дата окончания:</span>
                  <input
                    type="date"
                    value={end_date}
                    min={start_date}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input input-bordered border-base-300  bg-base-content mt-1"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {stages.map((stage, index) => (
                <div key={index} className="border border-base-300 rounded-xl p-4 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveStage(index)}
                    className="absolute top-3 right-3 right-2 text-accent hover:text-accent"
                  >
                    <FiX size={20} />
                  </button>
                  <h4 className="text-xl font-semibold mb-2">Этап {index + 1}</h4>

                  <label className="flex flex-col">
                    Название этапа:
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                      className="input input-bordered border-base-300  bg-base-content mt-1"
                    />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <label className="flex flex-col">
                      Дата начала:
                      <input
                        type="date"
                        value={stage.start_date}
                        onChange={(e) => handleStageChange(index, 'start_date', e.target.value)}
                        className="input input-bordered border-base-300  bg-base-content mt-1"
                      />
                    </label>

                    <label className="flex flex-col">
                      Дата окончания:
                      <input
                        type="date"
                        value={stage.end_date}
                        min={stage.start_date}
                        onChange={(e) => handleStageChange(index, 'end_date', e.target.value)}
                        className="input input-bordered border-base-300  bg-base-content mt-1"
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddStage}
                className="btn btn-outline btn-primary w-fit self-center"
              >
                <FiPlus className="mr-2" />
                Добавить этап
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary"
              >
                Назад
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-accent hover:border-accent hover:text-accent"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary text-base-content"
              >
                {currentStep === 1 ? 'Далее' : 'Создать проект'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});
