import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, GraduationCap, Layout } from 'lucide-react';
import { Button } from './components/Button';
import { CreatePlanModal } from './components/CreatePlanModal';
import { PlanDetail } from './components/PlanDetail';
import { StudyPlan } from './types';
import { ProgressBar } from './components/ProgressBar';

function App() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('certprep_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load plans", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('certprep_plans', JSON.stringify(plans));
  }, [plans]);

  const handlePlanCreated = (newPlan: StudyPlan) => {
    setPlans(prev => [newPlan, ...prev]);
    setActivePlanId(newPlan.id); // Auto open new plan
  };

  const handleToggleTopic = (planId: string, moduleId: string, topicId: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id !== planId) return plan;

      const updatedModules = plan.modules.map(module => {
        if (module.id !== moduleId) return module;
        
        return {
          ...module,
          topics: module.topics.map(topic => {
            if (topic.id !== topicId) return topic;
            return { ...topic, isCompleted: !topic.isCompleted };
          })
        };
      });

      // Recalculate totals
      let completedCount = 0;
      let totalCount = 0;
      updatedModules.forEach(m => {
        m.topics.forEach(t => {
          totalCount++;
          if (t.isCompleted) completedCount++;
        });
      });

      return {
        ...plan,
        modules: updatedModules,
        completedTopicsCount: completedCount,
        totalTopicsCount: totalCount
      };
    }));
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    if (activePlanId === planId) setActivePlanId(null);
  };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <CreatePlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPlanCreated={handlePlanCreated}
      />

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation / Header */}
        {!activePlan && (
          <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="text-indigo-600" size={32} />
                CertPrep AI
              </h1>
              <p className="text-slate-500 mt-1">Master your certification exams with intelligent planning.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-indigo-200">
              <Plus className="mr-2" size={18} />
              New Study Plan
            </Button>
          </header>
        )}

        <main>
          {activePlan ? (
            <PlanDetail 
              plan={activePlan} 
              onBack={() => setActivePlanId(null)}
              onToggleTopic={handleToggleTopic}
              onDelete={handleDeletePlan}
            />
          ) : (
            <div className="space-y-8">
              {plans.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
                   <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                     <Layout size={32} />
                   </div>
                   <h3 className="text-lg font-semibold text-slate-900">No plans yet</h3>
                   <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                     Ready to start learning? Create your first AI-generated study plan and track your progress towards certification.
                   </p>
                   <Button onClick={() => setIsModalOpen(true)}>
                     Create My First Plan
                   </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setActivePlanId(plan.id)}
                      className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <BookOpen size={20} />
                        </div>
                        {plan.completedTopicsCount === plan.totalTopicsCount && (
                           <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                             Done
                           </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {plan.examName}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                        {plan.title}
                      </p>

                      <div className="mt-auto">
                        <ProgressBar current={plan.completedTopicsCount} total={plan.totalTopicsCount} />
                        <div className="flex justify-between items-center mt-4 text-xs text-slate-400 font-medium">
                           <span>{plan.modules.length} Modules</span>
                           <span>{new Date(plan.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;